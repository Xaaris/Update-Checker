'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const SUBSCRIPTION_TABLE = process.env.SUBSCRIPTION_TABLE;

async function subscribe(userId, productId) {
    const timestamp = new Date().getTime();
    const params = {
        TableName: SUBSCRIPTION_TABLE,
        Item: {
            userId: userId,
            productId: productId,
            updatedAt: timestamp,
        },
    };
    await dynamoDb.put(params).promise();
}

module.exports.post = async (event, context) => {
    console.log(context);
    console.log(event);
    const userId = event.requestContext.authorizer.jwt.claims.sub;
    const querystring = event.queryStringParameters;
    const productId = querystring.productId;
    await createUserIfNonExistent(userId, event.headers.authorization)
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
        TableName: SUBSCRIPTION_TABLE,
        Key: {
            userId: userId,
            productId: productId,
        },
    };
    const data = await dynamoDb.delete(params).promise();
    console.log(`Deleted item: ${JSON.stringify(data)}`)
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

module.exports.getSubscribedUsersForProduct = async (productId) => {
    const params = {
        TableName : SUBSCRIPTION_TABLE,
        KeyConditionExpression: 'productId = :productId',
        ExpressionAttributeValues: {
            ':productId': productId
        },
        ProjectionExpression: ['userId']
    };
    let data = await dynamoDb.query(params).promise();
    return data.Items
}

async function listAllForUser(userId) {
    const params = {
        TableName : SUBSCRIPTION_TABLE,
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

module.exports.getAllForUser = async (event, context) => {
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

async function createUserIfNonExistent(userId, authHeader) {
    if (await userMissing(userId)) {
        const profile = await getUserInfo(authHeader);
        console.log('profile is: ', profile);
        console.log('Storing user profile');
        await storeUserProfile(profile);
    }
}

async function userMissing(userId) {
        const params = {
            TableName: process.env.USER_TABLE,
            Key:
                {
                    id: userId
                },
            AttributesToGet: [
                'id'
            ]
        }

        let exists = true
        let result = await dynamoDb.get(params).promise();
        if (result.Item !== undefined && result.Item !== null) {
            exists = false
        }

        return (exists)
}

async function getUserInfo(authHeader) {
    const {default: fetch} = await import('node-fetch')
    const response = await fetch('https://dev-hw-jobs-integration.eu.auth0.com/userinfo', {
        headers: {
            Authorization: authHeader
        }
    })

    if (response.ok) {
        return response.json()
    } else {
        throw new Error(`Wrong statusCode: ${response.statusCode}`)
    }
}

async function storeUserProfile(profile) {
    const timestamp = new Date().getTime();
    const params = {
        TableName: process.env.USER_TABLE,
        Item: {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            updatedAt: timestamp,
        },
    };
    await dynamoDb.put(params).promise();
}