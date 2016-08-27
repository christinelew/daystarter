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
        console.log('Response stream: ' + res);

        res.on('data', function (chunk) {
            body += chunk;
            console.log('Body: ' + body);
        });

        res.on('end', function () {
            // mailResult = '"' + body + '"';
            mailResult = JSON.parse(body);
            console.log('Mail result: ' + JSON.stringify(mailResult));
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });

    if(mailResult === "") {
        mailResult = {
            "@odata.context" : "https://outlook.office.com/api/v2.0/$metadata#Me/Messages(Subject,ReceivedDateTime,From)",
            "@odata.count" : 14197,
            "value" : [{
                "@odata.type" : "#Microsoft.OutlookServices.EventMessage",
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1ifAADXXgawgnPjQZ8z4K9wZxnqAAEpcS5mAAA=')",
                "@odata.etag" : "W/\"CwAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnsxQ\"",
                "Id" : "AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1ifAADXXgawgnPjQZ8z4K9wZxnqAAEpcS5mAAA=",
                "ReceivedDateTime" : "2016-08-27T02:24:37Z",
                "Subject" : "HOLD: LA Office Hack-a-thon",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Yu, Anthony",
                        "Address" : "anthony.yu@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0IwAAAA==')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrYS\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0IwAAAA==",
                "ReceivedDateTime" : "2016-08-27T01:55:10Z",
                "Subject" : "Your Kindle App: Tips to Get Started",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Amazon.com",
                        "Address" : "store-news@amazon.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0JAAAAA==')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrYH\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0JAAAAA==",
                "ReceivedDateTime" : "2016-08-27T00:30:17Z",
                "Subject" : "Revision to Your Amazon.com Account",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Amazon.com",
                        "Address" : "account-update@amazon.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPFAAA=')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrYl\"",
                "Id" : "AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPFAAA=",
                "ReceivedDateTime" : "2016-08-27T00:08:37Z",
                "Subject" : "Individual Views for Badge DG on mobile",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Hawley, Victor",
                        "Address" : "victor.hawley@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPEAAA=')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrYF\"",
                "Id" : "AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPEAAA=",
                "ReceivedDateTime" : "2016-08-26T23:59:52Z",
                "Subject" : "Finfest 2016 - NEED VOLUNTEERS",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Carroll, Kate",
                        "Address" : "Kate.Carroll@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPDAAA=')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrYk\"",
                "Id" : "AAMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAAAAAALpYZfFVNiSLnXungoTMfuBwB7TxJbRH02RLtceoos9GEWAAAAm1icAADXXgawgnPjQZ8z4K9wZxnqAAEpcQPDAAA=",
                "ReceivedDateTime" : "2016-08-26T22:49:12Z",
                "Subject" : "Load test log inspection preliminary results",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Kitzes, Steven",
                        "Address" : "steven.kitzes@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAhcjAAAA114GsIJz40GfM_CvcGcZ6gAAAsD-AAAA')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrX+\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAhcjAAAA114GsIJz40GfM_CvcGcZ6gAAAsD-AAAA",
                "ReceivedDateTime" : "2016-08-26T22:48:10Z",
                "Subject" : "FW: LSA Status",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Lem, Mark",
                        "Address" : "Mark.Lem@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0IgAAAA==')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrX8\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYnwAAANdeBrCCc_NBnzPgr3BnGeoAAAK0IgAAAA==",
                "ReceivedDateTime" : "2016-08-26T22:43:21Z",
                "Subject" : "Welcome to Postman",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Postman Team",
                        "Address" : "noreply@notifications.getpostman.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAhcjAAAA114GsIJz40GfM_CvcGcZ6gAAAsD_AAAA')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrX3\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAhcjAAAA114GsIJz40GfM_CvcGcZ6gAAAsD_AAAA",
                "ReceivedDateTime" : "2016-08-26T21:08:39Z",
                "Subject" : "RE: LSA Daily Updates",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Lem, Mark",
                        "Address" : "Mark.Lem@parivedasolutions.com"
                    }
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Messages('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAheOAAAA114GsIJz40GfM_CvcGcZ6gAAArECAAAA')",
                "@odata.etag" : "W/\"CQAAABYAAADXXgawgnPjQZ8z4K9wZxnqAAEpnrX2\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcA114GsIJz40GfM_CvcGcZ6gAAAheOAAAA114GsIJz40GfM_CvcGcZ6gAAArECAAAA",
                "ReceivedDateTime" : "2016-08-26T21:06:46Z",
                "Subject" : "FW: Single Identity Customer Attributes",
                "From" : {
                    "EmailAddress" : {
                        "Name" : "Hawley, Victor",
                        "Address" : "victor.hawley@parivedasolutions.com"
                    }
                }
            }
            ],
            "@odata.nextLink" : "https://outlook.office.com/api/v2.0/Me/Messages/?%24select=Subject%2cReceivedDateTime%2cFrom&%24orderby=ReceivedDateTime+desc&%24count=true&%24filter=IsRead+eq+true&%24top=10&%24skip=10"
        };

    }
	
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
	speechText = "You have " + mailResult.value.length + " unread mails";
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

    if(stringResult === "") {
        stringResult = {
            "@odata.context" : "https://outlook.office.com/api/v2.0/$metadata#Me/Events(Subject,Start,End)",
            "@odata.count" : 369,
            "value" : [{
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcqwAAAA==')",
                "@odata.etag" : "W/\"ZjAfEyFtPU++y3CWlFxthwABpFo=\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcqwAAAA==",
                "Subject" : "HOLD: LA Holiday Party",
                "Start" : {
                    "DateTime" : "2016-12-09T18:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-12-09T22:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcqgAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w5Q==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcqgAAAA==",
                "Subject" : "Q4 LA All Fins",
                "Start" : {
                    "DateTime" : "2016-11-03T15:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-11-03T17:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcPQAAAA==')",
                "@odata.etag" : "W/\"ZjAfEyFtPU++y3CWlFxthwABcfw=\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcPQAAAA==",
                "Subject" : "HOLD: FinFest 2016",
                "Start" : {
                    "DateTime" : "2016-10-21T08:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-10-21T17:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvQAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w0A==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvQAAAA==",
                "Subject" : "Review Usability Studies",
                "Start" : {
                    "DateTime" : "2016-08-29T14:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-29T14:30:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIclwAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABK8jZNg==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIclwAAAA==",
                "Subject" : "HOLD: Hack-a-thon MT judging",
                "Start" : {
                    "DateTime" : "2016-08-27T16:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-27T19:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvwAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABK8jZNQ==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvwAAAA==",
                "Subject" : "Hold for Hackathon Team Awesome",
                "Start" : {
                    "DateTime" : "2016-08-27T08:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-27T16:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvgAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w5w==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcvgAAAA==",
                "Subject" : "Hold for Hackathon Team Awesome",
                "Start" : {
                    "DateTime" : "2016-08-26T16:30:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-26T22:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcmwAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w6g==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcmwAAAA==",
                "Subject" : "HOLD: LA Office Hack-a-thon",
                "Start" : {
                    "DateTime" : "2016-08-26T16:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-27T19:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcugAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w4g==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcugAAAA==",
                "Subject" : "Review Three new Wires",
                "Start" : {
                    "DateTime" : "2016-08-26T11:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-26T12:00:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }, {
                "@odata.id" : "https://outlook.office.com/api/v2.0/Users('a84e3565-1d4f-4697-8b00-73004538dab2@be32aae3-7a3a-4fdb-b71a-161014dd062d')/Events('AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcwAAAAA==')",
                "@odata.etag" : "W/\"114GsIJz40GfM+CvcGcZ6gABKZ6w4Q==\"",
                "Id" : "AQMkAGZkZTljZDk2LWJhMGQtNDEyNC05YWY4LTBiODFmODE5ZWQxMwBGAAADC6WGXxVTYki517p4KEzH7gcAe08SW0R9NkS7XHqKLPRhFgAAAZtYpQAAANdeBrCCc_NBnzPgr3BnGeoAAAIcwAAAAA==",
                "Subject" : "Review MYCO and Rate Sheet process",
                "Start" : {
                    "DateTime" : "2016-08-26T10:30:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                },
                "End" : {
                    "DateTime" : "2016-08-26T11:30:00.0000000",
                    "TimeZone" : "Pacific Standard Time"
                }
            }
            ],
            "@odata.nextLink" : "https://outlook.office.com/api/v2.0/Me/Events/?%24select=Subject%2cStart%2cEnd&%24orderby=Start%2fDateTime+desc&%24count=true&startdatetime=2016-08-27T00%3a00%3a00.000Z&enddatetime=2016-08-28T00%3a00%3a00.000Z&%24top=10&%24skip=10"
        };
    }
	
	// loop through events subject and location/time

	speechText = "Here are your meetings.";
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