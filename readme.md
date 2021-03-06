Based on:
# Update Checker HackWeek 18 Project

A service which will go and check whether an update for a product is available.
The version is checked against a version stored in DynamoDB.
In case of an available update, the user is notified via email.

* vue frontend
* auth0/oauth2 authentication (frontend and backend)
* http api implemented with nodejs lambdas
* configurations stored in dynamoDb
* product checker business logic in nodejs lambdas

## Authentication / Authorization with Auth0

Authentication and authorization is handled by Auth0

### Configuration in Auth0 dashboard

* we created a tenant called `update-checker` in the EU region
* we added an application called **Product Checker**
  * the application was configured for SPA (option when generating)
  * RBAC was enabled (role based access control)
  * allowed the http://localhost:8080 and the cloudfront URL (https://d1u1ej0bxdutuj.cloudfront.net) to the following configurations
    * Allowed Callback URLs
    * Allowed Logout URLs
    * Allowed Web Origins
* we added an API called `UpdateChecker` with two permissions
  * `update-checker` - regular user permissions
  * `update-checker-admin` - admin permissions to view users
* we created two roles
  * Update Checker User - with `update-checker` permission
  * Update Checker Admin - with `update-checker` and `update-checker-admin` permissions

### Frontend 

The project uses an SPA frontend with Auth0 specific authentication. Even though OpenID Connect and OAuth2 are used under the hood, a specific library by Auth0 was used to make use of both protocols.

The library used here is called [auth0-spa-js](https://github.com/auth0/auth0-spa-js).

To implement the SPA part we used [this tutorial](https://auth0.com/docs/quickstart/spa/vuejs/01-login)

### How to use it:
#### Deploy
```
sls deploy
```

Before you deploy make sure the frontend is built:
```
cd frontend
npm run build
```

#### Invoke
Invoke a specific lambda function
```
sls invoke -f <FUNCTION_NAME>
```

#### Logs
Get cloudwatch logs for a specific lambda function
```
sls logs -f <FUNCTION_NAME>
```

#### Remove
Removes everything from AWS
```
sls remove
```

#### Use an AWS profile
If you have multiple AWS profiles on your machine, you can use a specific one by appending `--aws-profile <profile_name>` to any of the above commands.


# SES (Amazon Simple Email Service)
SES is used to send the emails. 
As of now, a sandbox account is used which sends emails via GMail from updatecheckermailer@gmail.com. 
The sand-boxing has the downside that both sender and receiver email addresses need to be verified before an email can be sent.
This can be done via the SES console.

## CloudFront

Due to lack of time (HW too short) CloudFront was set up via the AWS console.

To document the setup we used [former2 cli](https://github.com/iann0036/former2/blob/master/cli/README.md) to export the cloudformation representation to the file [cloudFront.yml](resources/cloudFront.yml).

```bash
former2 generate --services "CloudFront" --output-cloudformation "cloudFront.yaml" 
```

Cloud Front uses two origins to serve the user:
1. The S3 bucket for nearly all requests
2. The Api Gateway HTTP Api for all request starting with `/api/`

Important for the setup was to create a custom cache policy for the api gateway origin:
* disable caching
* allow the `Authorization` header to be forwarded (this means the header is considered part of the caching key)
* the same has to happen for the query parameters (here we just said that all query parameters should be considered as part of the caching key)

Update:
Cloudfront is now set up via serverless framework as well. 
However, I was not able to set up the cache policy for the api calls this way. 
This cache policy is therefore created manually through the aws UI.
It is called `NoCachePlusAuthorization` and configured as follows:
- Minimum TTL = 0
- Maximum TTL = 1
- Default TTL = 0
- Allowed headers: Authorization
- Allowed query strings: All
- Gzip enabled
- Brotli enabled
The id (in this case `c3e44aee-b2c4-4a53-a3f1-b5a5732a36e8`) needs to be referenced in the cloudFront.yml file.
