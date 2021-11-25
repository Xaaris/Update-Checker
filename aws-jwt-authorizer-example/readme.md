# Product Checker

A service which will go and check whether an update for a product is available. 
The version is checked against a version stored in DynamoDB.
In case of an available update, the user is notified via email.

### Technologies
- Lambdas
- Serverless Framework
- Node
- Vue

### How to use it:
#### Deploy
```
sls deploy
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


## CloudFront

Due to lack of time (HW too short) CloudFront was set up via the AWS console.

To document the setup we used [former2 cli](https://github.com/iann0036/former2/blob/master/cli/README.md) to export the cloudformation representation to the file [cloudFront.yaml](cloudFront.yaml).

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