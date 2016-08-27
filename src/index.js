/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * App ID for the skill
 */
var APP_ID = undefined;
var APP_ID = 'amzn1.ask.skill.b5628a6f-bc1d-4d2c-8e64-5e2bd46a2bf1';
var urlPrefix = 'https://ec2-54-211-239-93.compute-1.amazonaws.com/';


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * DayStarter is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var DayStarter = function () {
	require('ssl-root-cas').inject();
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
DayStarter.prototype = Object.create(AlexaSkill.prototype);
DayStarter.prototype.constructor = DayStarter;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
DayStarter.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
DayStarter.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("DayStarter onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    handleReadSummaryIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
DayStarter.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

DayStarter.prototype.intentHandlers = {
    "ReadSummaryIntent": function (intent, session, response) {
        handleReadSummaryIntent(session, response);
    },

    "ReadScheduleIntent": function (intent, session, response) {
        handleReadScheduleIntent(session, response);
    },

    "ReadEmailListIntent": function (intent, session, response) {
        handleReadEmailListIntent(session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "To hear your summary, say start my day."
		+ "To hear your schedule, say read my schedule."
		+ "To hear your unread emails, say read my emails.";

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Reading Daily Summary Output".
 */
function handleReadSummaryIntent(session, response) {
    var speechText = "";

    //Reprompt speech will be triggered if the user doesn't respond.
    var repromptText = "Would you like to hear your schedule or email?";
	
	var url = urlPrefix + "mail";
	var mailResult = "";

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            mailResult = JSON.parse(body);
            console.log('Mail result: ' + mailResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
	
	// var eventResult = "";
    // https.get(url, function(res) {
        // var body = '';

        // res.on('data', function (chunk) {
            // body += chunk;
        // });

        // res.on('end', function () {
            // eventResult = JSON.parse(body);
        // });
    // }).on('error', function (e) {
        // console.log("Got error: ", e);
    // });
	
	// Output Summary Text
	speechText = "You have " + mailResult['@odata.count'] + " unread mails";
	//speechText = "You have " + mailResult['@odata.count'] + " meetings and " + eventResult['@odata.count'] + " events today";

    var speechOutput = {
        speech: speechText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
	
    response.askWithCard(speechOutput, repromptOutput, "Read Summary", speechText);
}

/**
 * Reading daily schedule 
 */
function handleReadScheduleIntent(session, response) {
    var speechText = "";
    var repromptText = "";

	var url = urlPrefix + "calendar";
	var stringResult = "";
    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            stringResult = JSON.parse(body);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
	
	// loop through events subject and location/time

	speechText = "Here are your meeting.";
	for(var meeting in stringResult.value) {
		speechText += meeting.Organizer.EmailAddress.Name + " sent ";
		speechText += meeting.Subject;
		speechText += " scheduled for " + meeting.Start.DateTime;
		speechText += " at " + meeting.Location.DisplayName;
	}
    repromptText = "You can ask, read my email or read my schedule";
    
    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    response.ask(speechOutput, repromptOutput);
}

/**
 * Delivers the punchline of the joke after the user responds to the setup.
 */
function handleReadEmailListIntent(session, response) {
    var speechText = "";
    var repromptText = "";

	var url = urlPrefix + "mail";
	var stringResult = "";
    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            stringResult = JSON.parse(body);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
	
	
	// loop through  sender and email subject
	
	speechText = "Here are your unread emails.";
	for(var email in stringResult.value) {
		speechText += email.Sender.EmailAddress.Name + " sent";
		speechText += email.Subject;
	}
	
    repromptText = "You can ask, read my email or read my schedule";
    
    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: '<speak>' + repromptText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    response.ask(speechOutput, repromptOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the DayStarter Skill.
    var skill = new DayStarter();
    skill.execute(event, context);
};