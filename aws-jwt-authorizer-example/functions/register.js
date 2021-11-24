'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

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
    const data = await dynamoDb.put(params).promise();
    console.log(`Stored item: ${data}`)
    return data;
}

module.exports.post = async (event, context, callback) => {
    console.log(context);
    console.log(event);
    try {
        const profile = await getUserInfo(event.headers.authorization);
        console.log('profile is: ', profile);
        console.log('Storing user profile');
        await storeUserProfile(profile);
        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(profile),
        };
    } catch (error) {
        console.log('Error is: ', error);
        return {
            statusCode: 502,
            body: JSON.stringify({
                message: error.message,
            })
        }
    }
};
