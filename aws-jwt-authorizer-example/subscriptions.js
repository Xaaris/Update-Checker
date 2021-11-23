'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function subscribe(userId, productId) {
    const timestamp = new Date().getTime();
    const params = {
        TableName: process.env.SUBSCRIPTION_TABLE,
        Item: {
            userId: userId,
            productId: productId,
            updatedAt: timestamp,
        },
    };
    const data = await dynamoDb.put(params).promise();
    console.log(`Stored item: ${data}`)
    return data;
}

module.exports.post = async (event, context) => {
    console.log(context);
    console.log(event);
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const querystring = event.queryStringParameters;
    const productId = querystring.productId;
    if (productId) {
        console.log(`Subscribing to: ${productId}`);
        await subscribe(userId, productId);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Subcribed to ${productId}`
            }),
        };
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Missing productId parameter'
            }),
        };
    }

};