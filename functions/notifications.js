'use strict';

const AWS = require('aws-sdk');
const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION
const SNS_TOPIC_ARN = process.env.SNS_USER_NOTIFICATION_TOPIC_ARN
const SNS = new AWS.SNS({region: AWS_DEPLOY_REGION})
const SES = new AWS.SES({region: AWS_DEPLOY_REGION});

const {getSubscribedUsersForProduct} = require("./subscriptions");
const {getUser} = require("./users");

module.exports.sendEmail = async (event, context) => {
    const userNotification = JSON.parse(event.Records[0].Sns.Message)
    console.log(`Incoming userNotification: ${userNotification}`);

    const email = {
        Destination: {
            ToAddresses: [userNotification.email],
        },
        Message: {
            Subject: {Data: `Update available for ${userNotification.productName} to ${userNotification.newVersion}`},
            Body: {
                Text: {
                    Data:
`Hey ${userNotification.userName}, 
                
an update for ${userNotification.productName} is available. 
                
Old version: ${userNotification.oldVersion}
New version: ${userNotification.newVersion}
                
Click here to find out what has changed: ${userNotification.releaseNotesLink}`
                },
            },

        },
        Source: "updatecheckermailer@gmail.com",
    };

    console.log(`Sending email: ${JSON.stringify(email)}`);
    return SES.sendEmail(email).promise()
};

module.exports.sendUserNotifications = async (event, context) => {
    const productNotification = JSON.parse(event.Records[0].Sns.Message)
    console.log(productNotification);

    const subscribers = await getSubscribedUsersForProduct(productNotification.productId);
    console.log(`subscribers: ${JSON.stringify(subscribers)}`)

    for (const subscriber of subscribers) {
        const userId = subscriber.userId
        const user = await getUser(userId)

        const message = {}
        message.userName = user.name
        message.email = user.email
        message.productName = productNotification.name
        message.oldVersion = productNotification.oldVersion
        message.newVersion = productNotification.newVersion
        message.releaseNotesLink = productNotification.releaseNotesLink
        console.log(`message: ${JSON.stringify(message)}`)
        await publishMessage(message)
    }
    return {
        statusCode: 200,
        body: JSON.stringify(subscribers),
    };
};

async function publishMessage(message) {
    const params = {
        Message: JSON.stringify(message),
        TopicArn: SNS_TOPIC_ARN
    }
    console.log(`publishing event ${JSON.stringify(params)}`)
    return SNS.publish(params).promise()
}