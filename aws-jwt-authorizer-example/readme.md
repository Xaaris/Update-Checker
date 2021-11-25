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

