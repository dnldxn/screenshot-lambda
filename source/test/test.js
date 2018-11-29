
const request = require('request');

const fs = require('fs');

const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});  // why do I need to do this?
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();


const urlBase = 'http://aventrix-screenshot.s3-website-us-east-1.amazonaws.com';
const memorySizes = {
    256:    0.000000417,
    512:    0.000000834,
    768:    0.000001250, 
    1024:   0.000001667,
    1536:   0.000002501,
    2048:   0.000003334
};
const iterations = 50;
const imageBucketName = 'aventrix-screenshot';
const imageName = "M52Dd2mSHE1.png";

var params = {
    FunctionName: 'aws-dev-screenshot',
    MemorySize: 128
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url) {
    return new Promise((resolve, reject) =>
        request(url, (error, response, body) => {
            if (error) {
                console.log('error:', error);
                reject(error);
            }
            resolve(response.statusCode);
        })
    )
}

async function updateLambda(memorySize) {
    params['MemorySize'] = memorySize;

    return new Promise((resolve, reject) => {
        lambda.updateFunctionConfiguration(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                reject(err);
            }
            resolve(data);
        });
    })
}


async function deleteS3Object() {
    return new Promise((resolve, reject) => {
        s3.deleteObject({Bucket: imageBucketName, Key: imageName}, function(err, data) {
            if (err){
                console.log(err, err.stack);
                reject(err);
            }
            resolve(data);
        });
    });
}

async function run() {

    const csv = await fs.createWriteStream("log.csv", {flags: 'w'});
    await csv.write("iteration,memory_size,execution_time,estimated_cost\n");

    for(const memorySize in memorySizes) {

        await updateLambda(memorySize);
        await sleep(10000);  // give AWS some time to update the Lambda function

        for(var j = 0; j < iterations; j++) {
            console.log(`Sending GET request #${j} of ${memorySize}MB`);

            const startTime = Date.now();
            const response = await makeRequest(`${urlBase}/${imageName}`);
            const duration = Date.now() - startTime;
            const estimatedCost = (duration / 100) * memorySizes[memorySize]

            await csv.write(`${j},${memorySize},${duration},${estimatedCost}\n`);

            await deleteS3Object();
            await sleep(5000);  // give AWS some time to delete the object
        }
    }

    await csv.close();
};

run();
