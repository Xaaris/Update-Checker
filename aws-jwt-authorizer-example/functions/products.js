'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

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

async function getProduct(productId) {
    const params = {
        TableName: process.env.PRODUCT_TABLE,
        Key:
            {id: productId}
    }
    return dynamoDb.get(params).promise();
}

module.exports.get = async (event, context) => {
    console.log(context);
    console.log(event);

    let productId = event.pathParameters.id

    if (productId) {
        console.log(`Getting product with id: ${productId}`);
        const product = await getProduct(productId);
        return {
            statusCode: 200,
            body: JSON.stringify(product),
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