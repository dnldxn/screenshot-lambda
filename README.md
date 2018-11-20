# How to Run

<https://github.com/adieuadieu/serverless-chrome>

```bash
npm install -g serverless
serverless create -u https://github.com/adieuadieu/serverless-chrome/tree/master/examples/serverless-framework/aws
cd aws
npm install

# deploy entire package
serverless deploy -v

# deploy single function
serverless deploy function -f screenshot

serverless remove
```

```bash
docker run -d --rm --name headless-chromium -p 9222:9222 adieuadieu/headless-chromium-for-aws-lambda
```


https://s3.us-east-1.amazonaws.com/aventrix-screenshot/abc.png