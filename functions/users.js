'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function listAll() {
    const users = [];
    let items;
    const params = {TableName: process.env.USER_TABLE, AttributesToGet: ['id', 'name', 'email']};
    do {
        items = await dynamoDb.scan(params).promise();
        if (items && items.Items) {
            items.Items.forEach((item) => users.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }
    } while (typeof items.LastEvaluatedKey !== 'undefined');
    return users;
}

function getScopes(event) {
    const scopes = event.requestContext.authorizer.jwt.claims.scope;
    console.log(`Scopes: ${scopes}`)
    if (scopes) {
        return new Set(scopes.split(' '));
    } else {
        return new Set();
    }
}

function isAdmin(event) {
    const scopes = getScopes(event)
    return scopes.has('productchecker_admin')
}

module.exports.get = async (event, context) => {
    console.log(context);
    console.log(event);

    if (!isAdmin(event)) {
        return {
            statusCode: 403,
            body: JSON.stringify({
                message: 'You need to be admin to use this endpoint'
            }),
        }
    }

    const users = await listAll();

    console.log(`Users: ${users}`);

    return {
        statusCode: 200,
        body: JSON.stringify(users),
    };
};
module.exports.getUser = async (userId) => {
    const params = {
        TableName: process.env.USER_TABLE,
        Key: { id: userId }
    }

    const users = await dynamoDb.get(params).promise();
    return users.Items
}