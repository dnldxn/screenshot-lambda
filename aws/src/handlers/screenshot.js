import log from '../utils/log'
import screenshot from '../chrome/screenshot'

import aws from 'aws-sdk'
const s3 = new aws.S3()

export default async function handler (event, context, callback) {

  // const BUCKET = process.env.BUCKET

  const queryStringParameters = event.queryStringParameters || {}
  const {
    resource = '1',
  } = queryStringParameters

  // remove the file extension (.png) to get the User's public ID
  const userId = resource.substring(0, resource.lastIndexOf('.')) 
  const url = `https://www.aventrix.com/users/${userId}/charts`
  const filename = `${userId}.png`

  let data;

  log('Processing screenshot capture for', url)

  const startTime = Date.now();

  try {
    data = await screenshot(url)
  } catch (error) {
    console.error('Error capturing screenshot for', url, error)
    return callback(error)
  }

  log(`Chromium took ${Date.now() - startTime}ms to load URL and capture screenshot.`)

  // respond with a redirect to the new S3 image
  const response = {
    statusCode: 200,
    body: data,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'image/png',
    },
  };

  return callback(null, response);
}
