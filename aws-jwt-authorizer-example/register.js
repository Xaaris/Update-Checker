'use strict';

var https = require('https');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function getUserInfo(authHeader) {
    const options = {
        hostname: 'dev-hw-jobs-integration.eu.auth0.com',
        port: 443,
        method: 'GET',
        path: '/userinfo',
        headers: {
            Authorization: authHeader
        }
    }

    return new Promise((resolve, reject) => {
        const req = https.get(options, res => {
            if (res.statusCode === 200) {
            let rawData = '';

            res.on('data', chunk => {
                rawData += chunk;
            });
        
            res.on('end', () => {
                try {
                resolve(JSON.parse(rawData));
                } catch (err) {
                reject(new Error(err));
                }
            });
            } else {
            reject(new Error(`Wrong statusCode: ${res.statusCode}`));
            }
        
        });

        req.on('error', err => {
        reject(new Error(err));
        });
    });
};

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