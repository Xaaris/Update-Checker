'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE = process.env.PRODUCT_TABLE;

async function listAll() {
    const products = [];
    let items;
    const params = {TableName: process.env.PRODUCT_TABLE, AttributesToGet: ['id', 'name', 'provider', 'currentVersion']};
    do {
        items = await dynamoDb.scan(params).promise();
        if (items && items.Items) {
            items.Items.forEach((item) => products.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }
    } while (typeof items.LastEvaluatedKey !== 'undefined');
    return products;
}

module.exports.getAll = async (event, context) => {
    console.log(context);
    console.log(event);

    const products = await listAll();

    console.log(`Products: ${products}`);

    return {
        statusCode: 200,
        body: JSON.stringify(products),
    };
};

module.exports.getProduct = async (productId) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        Key: {id: productId}
    }
    return dynamoDb.get(params).promise();
}

module.exports.getProductsByProvider = async (provider) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        IndexName: 'providerIndex',
        KeyConditionExpression: 'provider = :provider',
        ExpressionAttributeValues: {':provider': provider}
    }
    const result = await dynamoDb.query(params).promise();
    return result.Items
}

module.exports.updateProduct = async (product) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        Key: {id: product.id},
        UpdateExpression: `set majorVersion = :majorVersion, 
        minorVersion = :minorVersion, 
        bugfixVersion = :bugfixVersion, 
        currentVersion = :currentVersion, 
        releaseNotesLink = :releaseNotesLink`,
        ExpressionAttributeValues: {
            ":majorVersion": product.majorVersion,
            ":minorVersion": product.minorVersion,
            ":bugfixVersion": product.bugfixVersion,
            ":currentVersion": product.currentVersion,
            ":releaseNotesLink": product.releaseNotesLink,
        }
    }
    return dynamoDb.update(params)
        .promise();
}