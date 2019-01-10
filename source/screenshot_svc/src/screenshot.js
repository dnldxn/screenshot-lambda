const CDP = require('chrome-remote-interface');

function sleep (miliseconds = 100) {
    return new Promise(resolve => setTimeout(() => resolve(), miliseconds))
}

export default async function handler (event, context, callback) {

  const LOAD_TIMEOUT = process.env.PAGE_LOAD_TIMEOUT || 1000 * 60;
  const queryStringParameters = event.queryStringParameters || {};
  const {
    resource = '1',
  } = queryStringParameters;

  // If the query string param does not match the expected format, return an error
  let is_resource_valid = /^[a-zA-Z0-9~_]{11}\.png$/.test(resource);  // 11 "valid" chars followed by ".png"
  if(is_resource_valid == false) {
    console.error('Query parameter "" does not match the expected format.');
    callback(null, { statusCode: 404, headers: { "Content-Type": "text/plain" } });
  }

  // remove the file extension (.png) to get the User's public ID
  const userId = resource.substring(0, resource.lastIndexOf('.'));
  const url = `https://www.aventrix.com/users/${userId}/infographic`;

  console.log('Processing screenshot capture for', url);

  const startTime = Date.now();

  let data;  //screenshot PNG data
  let img;
  let loaded = false;

  // this function runs in the background, keeping the time, until the webpage is loaded
  const loading = async (startTime = Date.now()) => {
    if (!loaded && Date.now() - startTime < LOAD_TIMEOUT) {
      await sleep(100);
      await loading(startTime);
    }
  };

  const [tab] = await CDP.List();
  const client = await CDP({ host: '127.0.0.1', target: tab });

  const { Network, Page, Runtime, Emulation } = client;

  // handler that is fired just before network request is sent
  Network.requestWillBeSent((params) => {
    console.log('Chrome is sending request for:', params.request.url)
  });

  // handler that is fired once the page request is finished
  Network.responseReceived((params) => {
    if(params.response.url == url && params.response.status != 200) {
      console.error('The URL to screenshot did not return status 200.  Might be an invalid user ID.');
      callback(null, { statusCode: 404, headers: { "Content-Type": "text/plain" } });
    }
  });

  Page.loadEventFired(() => {
    loaded = true;
  });

  try {
    await Promise.all([Network.enable(), Page.enable()])

    await Emulation.setDeviceMetricsOverride({
      mobile: false,
      deviceScaleFactor: 0,
      scale: 1,
      width: 500,
      height: 500, // Letter size
    });

    await Page.navigate({ url });
    await Page.loadEventFired();
    await loading();

    const screenshot = await Page.captureScreenshot({ format: 'png' });
    data = screenshot.data;
    // img = new Buffer(data, 'base64');

  } catch (error) {
    console.error('Error capturing screenshot for', url, error);
  }

  await client.close();

  console.log(`Chromium took ${Date.now() - startTime}ms to load URL and capture screenshot.`)

  return {
    statusCode: 200,
    body: data,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': data.length
    },
  };
}
