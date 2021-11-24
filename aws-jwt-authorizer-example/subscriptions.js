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

async function unsubscribe(userId, productId) {
    const params = {
        TableName: process.env.SUBSCRIPTION_TABLE,
        Key: {
            userId: userId,
            productId: productId,
        },
    };
    const data = await dynamoDb.delete(params).promise();
    console.log(`Deleted item: ${data}`)
    return data;
}

module.exports.delete = async (event, context) => {
    console.log(context);
    console.log(event);
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const querystring = event.queryStringParameters;
    const productId = querystring.productId;
    if (productId) {
        console.log(`Unsubscribing to: ${productId}`);
        await unsubscribe(userId, productId);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Deleted subscription to ${productId}`
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

async function listAllForUser(userId) {
    const params = {
        TableName : process.env.SUBSCRIPTION_TABLE,
        KeyConditionExpression: 'userId = :userId',
        IndexName: 'UserIdIndex',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ProjectionExpression: ['productId']
    };
    let data = await dynamoDb.query(params).promise();
    return data.Items
}

module.exports.get = async (event, context) => {
    console.log(context);
    console.log(event);

    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const subscriptions = await listAllForUser(userId);

    console.log(`Subscriptions for user ${userId}: ${JSON.stringify(subscriptions)}`);

    return {
        statusCode: 200,
        body: JSON.stringify(subscriptions),
    };
};