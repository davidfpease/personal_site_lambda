'use strict';
console.log('Loading hello world function');
const axios = require('axios');

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

  //if inbound request is from the start of a conversation do the following:
  if(event.queryStringParameters.newConversation){
    let driftResponseNew = await new Promise((resolve, reject) => {
      if (!conversationId === ""){
        console.log("no conversationID!!!")
        resolve({
          statusCode: 400,
          body: 'No conversationId provided.',
        })
      }
      const data = JSON.stringify({
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
      const config = {
        method: 'post',
        url: `https://driftapi.com/conversations/${conversationId}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OAUTH_TOKEN}`
        },
        data: data
      };
      axios(config)
        .then(function (response) {
          resolve({
            statusCode: 200,
            body: JSON.stringify(response.data),
          })
        })
        .catch(function (error) {
          console.log(error);
          reject({
            statusCode: 500,
            body: "Something is broken.",
          })
        });
    })
  }

  //if inbound request is from a button click
  if (event.queryStringParameters.dadJoke && event.httpMethod === 'GET') {
    let driftResponseJoke = await new Promise((resolve, reject) => {
      if (!conversationId === "") {
        console.log("no conversationID!!!")
        resolve({
          statusCode: 400,
          body: 'No conversationId provided.',
        })
      }
      const jokeConfig = {
        method: 'get',
        url: 'https://www.icanhazdadjoke.com',
        headers: {
          'User-Agent': 'https://davidpease.me',
          'Accept': 'application/json',
        }
      };

      axios(jokeConfig)
        .then(function (response) {
          resolve({
            statusCode: 200,
            body: response.data,
          })
        })
        .catch(function (error) {
          console.log(error);
          reject({
            statusCode: 500,
            body: "Something is broken.",
          })
        });
    }).catch(error => console.error(error));  

    console.log("driftResponseJoke");
    console.log(driftResponseJoke);

    let sendJoke = await new Promise((resolve, reject) => {
      let joke = driftResponseJoke.body.joke;
      const data = JSON.stringify({
        "type": "chat",
        "body": joke,
      });
      const config2 = {
        method: 'post',
        url: `https://driftapi.com/conversations/${conversationId}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OAUTH_TOKEN}`
        },
        data: data
      };

      axios(config2)
        .then(function (response) {            
          console.log("Joke sent to API");
          const data = JSON.stringify({
            "type": "chat",
            "body": "Would you like to hear another joke?",
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
          const config2 = {
            method: 'post',
            url: `https://driftapi.com/conversations/${conversationId}/messages`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OAUTH_TOKEN}`
            },
            data: data
          };

          axios(config2)
            .then(function (response) {
              console.log("ASked for more jokes");
              resolve();
            })
            .catch(function (error) {
              console.log(error);
              reject();
            });
      })
        .catch(function (error) {
          console.log(error);
        });

    }).catch(error => console.error(error));
  }


//handle an inbound joke request
  let dadJoke = `Good day sir!`;
  

  let responseBody = {
    message: dadJoke,
    input: event,
    conversationId: conversationId+"",
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

            