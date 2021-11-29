'use strict';

const AWS = require('aws-sdk');
const AWS_DEPLOY_REGION = process.env.AWS_DEPLOY_REGION
const SNS_TOPIC_ARN = process.env.SNS_USER_NOTIFICATION_TOPIC_ARN
const SNS = new AWS.SNS({region: AWS_DEPLOY_REGION})

const {getSubscribedUsersForProduct} = require("./subscriptions");
const {getUser} = require("./users");

module.exports.sendUserNotifications = async (event, context) => {
    const productNotification = JSON.parse(event.Records[0].Sns.Message)
    console.log(productNotification);

    const subscribers = await getSubscribedUsersForProduct(productNotification.productId);
    console.log(`subscribers: ${JSON.stringify(subscribers)}`)

    subscribers.forEach(subscriber => {
        const userId = subscriber.userId
        const user = getUser(userId)

        const message = {}
        message.userName = user.name
        message.email = user.email
        message.productName = productNotification.name
        message.oldVersion = productNotification.oldVersion
        message.newVersion = productNotification.newVersion
        message.releaseNotesLink = productNotification.releaseNotesLink

        publishMessage(message)
    })
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