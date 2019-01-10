
# ToDo

- ddos protection
- cloudformation + lambda
- return error code if user does not exist (404)
- url param validation and injection protection

# How to Run

First run the CloudFormation script.

```bash
cd aws/cloudformation-templates


```

Based on:
<https://github.com/adieuadieu/serverless-chrome>

Install the Lambda functions.

```bash
npm install -g serverless

cd source/screenshot_svc

# deploy locally for development (offline)
sls offline start

# deploy entire package to AWS
sls deploy -v

# remove the Lambda functions from AWS
sls remove
```

# Network Config

Lambda functions can exist inside a subnet.
