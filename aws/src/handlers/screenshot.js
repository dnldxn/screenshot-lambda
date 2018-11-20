import log from '../utils/log'
import screenshot from '../chrome/screenshot'

import aws from 'aws-sdk'
const s3 = new aws.S3()

export default async function handler (event, context, callback) {

  const BUCKET = process.env.BUCKET

  const queryStringParameters = event.queryStringParameters || {}
  const {
    resource = '1',
  } = queryStringParameters

  // remove the file extension (.png) to get the User's public ID
  const userId = resource.substring(0, resource.lastIndexOf('.')) 
  const url = `https://www.aventrix.com/users/${userId}/charts`
  const filename = `${userId}.png`

  let buffer;

  log('Processing screenshot capture for', url)

  const startTime = Date.now();

  try {
    buffer = await screenshot(url)
  } catch (error) {
    console.error('Error capturing screenshot for', url, error)
    return callback(error)
  }

  // upload image to S3
  console.log(`Uploading screenshot 's3://${BUCKET}/${filename}'`)
  const s3Params = {
      Bucket: BUCKET,
      Key: filename,
      ContentType: "image/png",
      Body: buffer
  };

  await s3.putObject(s3Params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("uploading succeeded");
    }
  }).promise();
  console.log("uploading completed");

  log(`Chromium took ${Date.now() - startTime}ms to load URL and capture screenshot.`)

  // respond with a redirect to the new S3 image
  const response = {
    statusCode: 307,
    headers: {
      Location: `http://${BUCKET}.s3-website-us-east-1.amazonaws.com/${filename}`,
    }
  }

  return callback(null, response)
}
