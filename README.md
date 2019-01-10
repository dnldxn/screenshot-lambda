
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
serverless offline start

# deploy entire package to AWS
serverless deploy -s dev -v

# remove the Lambda functions from AWS
serverless remove
```

# Network Config

Lambda functions can exist inside a subnet, and can apply SecurityGroup to them.

How to protect the ApiGateway endpoint?
