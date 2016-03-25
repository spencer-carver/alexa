/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

var doc = require('dynamodb-doc');
var dynamo = new doc.DynamoDB();

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("SingleLeaveIntent" === intentName) {
        singleLeavingReply(intent, session, callback);
    } else if ("DoubleLeaveIntent" === intentName) {
        multiLeavingReply(intent, session, callback);
    } else if ("SingleReturnIntent" === intentName) {
        singleReturnReply(intent, session, callback);
    } else if ("DoubleReturnIntent" === intentName) {
        multiReturnReply(intent, session, callback);
    } else if ("AbsenceQueryIntent" === intentName) {
        queryReply(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        getStopResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getStopResponse(callback) {
    var cardTitle = "Stop";
    var speechOutput = "Goodbye.";
    var repromptText = "";
    var shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Watchdog is eagerly awaiting a command.";
    var repromptText = "Watchdog is chasing its tail waiting for a command...";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Echo
 */
function singleLeavingReply(intent, session, callback) {
    var options = {
        cardTitle: intent.name,
        speechOutput: "",
        repromptText: "",
        sessionAttributes: {},
        shouldEndSession: true
    };
    var user = intent.slots.User;
    
    personLeaving(options, user, callback);
}

function multiLeavingReply(intent, session, callback) {
    // TODO
}

function singleReturnReply(intent, session, callback) {
    var options = {
        cardTitle: intent.name,
        speechOutput: "",
        repromptText: "",
        sessionAttributes: {},
        shouldEndSession: true
    };
    var user = intent.slots.User;
    
    personReturning(options, user, callback);
}

function multiReturnReply(intent, session, callback) {
    // TODO
}

function queryReply(intent, session, callback) {
    var options = {
        cardTitle: intent.name,
        speechOutput: "",
        repromptText: "",
        sessionAttributes: {},
        shouldEndSession: true
    };
    var user = intent.slots.User;
    
    queryPersonStatus(options, user, callback);
}

// -------------- Helpers that manage database interactions ----------------------

function personLeaving(options, user, callback) {
    //Setup Database
    var tableName = "departureTimes";
    var now = new Date();
    var item = {
        "username": user.value,
        "dateTime": now.toString()
    };

    var params = {
        TableName: tableName,
        Item: item
    };

    dynamo.putItem(params, function (err, data) {
        if (err) {
            processError(options, callback);
        } else {
            processLeaveData(options, data.Item, callback);
        }
    });
}

function personReturning(options, user, callback) {
    //Setup Database
    var tableName = "departureTimes";
    var key = {
        "username": user.value
    };

    var params = {
        TableName: tableName,
        Key: key
    };

    dynamo.getItem(params, function (err, data) {
        if (err) {
            processError(options, callback);
        } else if (data.Item === undefined) {
            processEmptyResponse(options, user.value, callback);
        } else {
            processReturnData(options, data.Item, callback);
        }
    });
}
function queryPersonStatus(options, user, callback) {
    //Setup Database
    var tableName = "departureTimes";
    var key = {
        "username": user.value
    };

    var params = {
        TableName: tableName,
        Key: key
    };

    dynamo.getItem(params, function (err, data) {
        if (err) {
            processError(options, callback);
        } else if (data.Item === undefined) {
            processEmptyResponse(options, user.value, callback);
        } else {
            processQueryData(options, data.Item, callback);
        }
    });
}

function processLeaveData(options, row, callback) {
    var speechOutput = "Have a good day!";

    callback(options.sessionAttributes,
        buildSpeechletResponse( options.cardTitle, 
                                speechOutput, 
                                options.repromptText, 
                                options.shouldEndSession));
}

function processReturnData(options, row, callback) {
    var departureTime = new Date(row.dateTime);
    var returnTime = new Date();

    var awayTime = getDifference(departureTime, returnTime);
    var speechOutput =  "Welcome back. You have been gone for " + awayTime;

    callback(options.sessionAttributes,
        buildSpeechletResponse( options.cardTitle, 
                                speechOutput, 
                                options.repromptText, 
                                options.shouldEndSession));
}

function processQueryData(options, row, callback) {
    var departureTime = new Date(row.dateTime);
    var returnTime = new Date();

    var awayTime = getDifference(departureTime, returnTime);
    var speechOutput =  "My records indicate that " + row.username + " has been gone for " + awayTime;

    callback(options.sessionAttributes,
        buildSpeechletResponse( options.cardTitle, 
                                speechOutput, 
                                options.repromptText, 
                                options.shouldEndSession));
}

function processEmptyResponse(options, name, callback) {
    var speechOutput =  "Unfortunately my records don't seem to have a departure time saved for "+ name;

    callback(options.sessionAttributes,
        buildSpeechletResponse( options.cardTitle, 
                                speechOutput, 
                                options.repromptText, 
                                options.shouldEndSession));
}

function processError(options, callback) {
    var speechOutput =  "Whoops, something went wrong. Please try again.";

    callback(options.sessionAttributes,
        buildSpeechletResponse( options.cardTitle, 
                                speechOutput, 
                                options.repromptText, 
                                options.shouldEndSession));
}

function getDifference(date1, date2) {
  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
  //take out milliseconds
  difference_ms = difference_ms/1000;
  var seconds = Math.floor(difference_ms % 60);
  difference_ms = difference_ms/60; 
  var minutes = Math.floor(difference_ms % 60);
  difference_ms = difference_ms/60; 
  var hours = Math.floor(difference_ms % 24);  
  var days = Math.floor(difference_ms/24);

  var output = "";
  output += (days > 0) ? days + " days" : "";
  output += hours + " hours,";
  output += minutes + " minutes, and ";
  output += seconds + " seconds.";

  return output;
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}