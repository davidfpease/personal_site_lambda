'use strict';
console.log('Loading hello world function');
const axios = require('axios');
//console.log(axios);

exports.handler = async (event) => {
  let conversationId = "";
  let city = 'World';
  let time = 'day';
  let day = '';
  let responseCode = 200;
  console.log("request: " + JSON.stringify(event));

  if (event.queryStringParameters && event.queryStringParameters.conversationId) {
    console.log("Received conversationId: " + event.queryStringParameters.conversationId);
    conversationId = event.queryStringParameters.conversationId;
  }

  //var axios = require('axios');
  var data = JSON.stringify({
    "type": "chat",
    "body": "Hi!  I've sent a note to my human.  He'll jump in as soon as possible!  In the meantime would you like to hear a joke?",
    "buttons": [
      {
        "value": "Yes please!",
        "label": "Yes please!",
        "type": "reply",
        "reaction": {
          "type": "replace",
          "message": "OK, one second while I think of a good one..."
        }
      }
    ]
  });

  var config = {
    method: 'post',
    url: 'https://driftapi.com/conversations/3078008979/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer FfhkCAX2p2kYSJ4ku1B4NHJIrIy6yQeH'
    },
    data: data
  };
//this needs to be asynchronous (see medium article) new Promise....
  axios(config)
    .then(function (response) {
      console.log("From inside Axios");
      console.log(response);
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });



  if (event.queryStringParameters && event.queryStringParameters.city) {
    console.log("Received city: " + event.queryStringParameters.city);
    city = event.queryStringParameters.city;
  }

  if (event.headers && event.headers['day']) {
    console.log("Received day: " + event.headers.day);
    day = event.headers.day;
  }

  if (event.body) {
    let body = JSON.parse(event.body)
    if (body.time)
      time = body.time;
  }

  let greeting = `Good ${time}, name of ${city}.`;
  if (day) greeting += ` Happy ${day}!`;

  let responseBody = {
    message: greeting,
    input: event,
    conversationId: conversationId,
    oauth: process.env.OAUTH_TOKEN,
  };

  // The output from a Lambda proxy integration must be 
  // in the following JSON object. The 'headers' property 
  // is for custom response headers in addition to standard 
  // ones. The 'body' property  must be a JSON string. For 
  // base64-encoded payload, you must also set the 'isBase64Encoded'
  // property to 'true'.
  let response = {
    statusCode: responseCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify(responseBody)
  };
  console.log("response: " + JSON.stringify(response))
  return response;
};