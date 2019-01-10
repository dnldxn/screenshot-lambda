const CDP = require('chrome-remote-interface');

export default async function handler (event, context, callback) {
  let responseBody;

  console.log('Getting version info.');

  try {
    responseBody = await CDP.Version();
  } catch (error) {
    console.error('Error getting version info')
    return callback(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
