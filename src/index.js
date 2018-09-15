let turtles = {

    "michaelangelo": {
        "personality_trait": "is known as being free-spirited, relaxed, and often goofy jokester, and known for his love of pizza.",
        "weapon": "nunchuck",
        "nick_name": "Mickey"
    },
    "leonardo": {
        "personality_trait": "is known as being responsible, tactical, courageous and devoted student of his sensei.",
        "weapon": "Katana blade",
        "nick_name": "Leo"
    },
    "raphael": {
        "personality_trait": "is known as being physically strong, has an aggressive nature, sarcastic, oftentimes delivers deadpan humor, and seldom hesitates to throw the first punch.",
        "weapon": "sai",
        "nick_name": "Raph"
    },
    "donatello": {
        "personality_trait": "is known as being scientific, inventive, curious, and a technological genius.",
        "weapon": "bow staff",
        "nick_name": "Donnie"
    }

}


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        // if (event.session.application.applicationId !== "amzn1.ask.skill.0d2756bc-923a-4287-8a78-8e0e53571ba3") {
        //     context.fail("Invalid Application ID");
        // }

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
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
onSessionStarted = (sessionStartedRequest, session) => {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
onLaunch = (launchRequest, session, callback) => {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
onIntent = (intentRequest, session, callback) => {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    switch (intentName) {
        case 'TurtleIntent':
            handleTurtleResponse(intent, session, callback)
            break
        case 'AMAZON.YesIntent':
            handleYesResponse(intent, session, callback)
            break
        case 'AMAZON.NoIntent':
            handleNoResponse(intent, session, callback)
            break
        case 'AMAZON.HelpIntent':
            handleGetHelpRequest(intent, session, callback)
            break
        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
            handleFinishSessionRequest(intent, session, callback)
            break
        default:
            throw 'Invalid intent'
    }

    // if (intentName == 'TurtleIntent') {
    //     handleTurtleResponse(intent, session, callback)
    // } else if (intentName == 'AMAZON.YesIntent') {
    //     handleYesResponse(intent, session, callback)
    // } else if (intentName == 'AMAZON.NoIntent') {
    //     handleNoResponse(intent, session, callback)
    // } else if (intentName == 'AMAZON.HelpIntent') {
    //     handleGetHelpRequest(intent, session, callback)
    // } else if (intentName == 'AMAZON.StopIntent') {
    //     handleFinishSessionRequest(intent, session, callback)
    // } else if (intentName == 'AMAZON.CancelIntent') {
    //     handleFinishSessionRequest(intent, session, callback)
    // } else {
    //     throw 'Invalid intent'
    // }

}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session){

}

// ------- Skill specific logic -------

getWelcomeResponse = (callback) => {
    let speechOutput = `Welcome to Ninja Turtle Info! I can tell you about all these awesome turtles: Michaelangelo, Leonardo, Raphael, and Donatello. Which turtle would you like to know about?`

    let reprompt = 'Which turtle are you interested in? You can learn about Michaelangelo, Leonardo, Raphael, and Donatello.'

    let header = 'Ninja Turtle Info!'

    let shouldEndSession = false

    let sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))
}

handleTurtleResponse = (intent, session, callback) => {
    let turtle,
        speechOutput,
        repromptText,
        header;

    if (intent.slots.Turtle.value == null || intent.slots.Turtle.value == undefined) {
        turtle = intent.slots.Turtle.value
    } else {
        turtle = intent.slots.Turtle.value.toLowerCase()
    }

    if (!turtles[turtle]) {
        speechOutput = 'Please choose one of the four ninja turtles'
        repromptText = 'Try asking about another turtle.'
        header = 'No ninja turtle selected.'
    } else {
        let personality_trait = turtles[turtle].personality_trait
        let weapon = turtles[turtle].weapon
        let nick_name = turtles[turtle].nick_name
        speechOutput = capitalizeFirst(turtle) + " or otherwise known as " + nick_name + " " + personality_trait + ". His weapon of choice is the " + weapon + ". Would you like to learn about another turtle?"
        repromptText = 'Do you want to hear about more ninja turtles?'
        header = capitalizeFirst(turtle)
    }

    let shouldEndSession = false

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

handleYesResponse = (intent, session, callback) => {
    let speechOutput = 'Awesome! Which Turtle would you like to learn about? Michaelangelo, Leonardo, Raphael, or Donatello?'
    let repromptText = speechOutput
    let shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

handleNoResponse = (intent, session, callback) => {
    handleFinishSessionRequest(intent, session, callback)
}

handleGetHelpRequest = (intent, session, callback) => {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    let speechOutput = 'I can tell you facts about the ninja turtles. Their are four turtles named: Michaelangelo, Leonardo, Raphael, and Donatello. Which turtle would you like to learn about first?'
    let repromptText = speechOutput
    let shouldEndSession = false

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

handleFinishSessionRequest = (intent, session, callback) => {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Thank you for using Ninja Turtle Info. Good bye!", "", true));
}


// ------- Helper functions to build responses for Alexa -------


buildSpeechletResponse = (title, output, repromptText, shouldEndSession) => {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
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

buildSpeechletResponseWithoutCard = (output, repromptText, shouldEndSession) => {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
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

buildResponse = (sessionAttributes, speechletResponse) => {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

capitalizeFirst = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}