//global var the config
config = init();

function init() {
	var config = {
		// max messages to grab from the inbox. a large inbox gets slow so this helps process in batches.
		maxMessageCheck: 	50,
		// where to start in the list of inbox items. 0 is the beginning
		inboxStartingPoint: 0,
		// gmail label to file everything under
		processedMailLabel: "Gmail Label Name",
		// header title attached to sms reply messages
		headerTitle: 		"Title for all SMS",
		// leave blank
		gmailLabel: 		"",
		// move messages out of the inbox, this helps speed up the processing
		archiveMessages: 	true,

		/* 
			start optional params 
		*/

		// sendIntroMessage text
		introMsg: 			"Menu: \nReply with: 1 or 'directions', \n2 or 'wifi', \n3 or 'contact', \n4 or 'picture'",
		// sendDirections text
		locationAddress: 	"1234 Nobody Ave, Nowhere, USA 12345",
		// sendWifiInfo text
		wifiSSID: 			"SomethingCleverNoDoubt",
		wifiKey: 			"HopefullyNot12345",
		// sendContactInfo text
		contactInfo: 		"MasterOfCeremonies - 315-797-6111",

		/* 
			end optional params 
		*/

		gmailAddress: 		"WhateverAddressYoureUsingForThisSMS@gmail.com"
	};

	if (config.archiveMessages) {
		// get the GMail reference to the label
	    config.label = GmailApp.getUserLabelByName(config.processedMailLabel);

	    // create the label, if it doesnt exist
	    if (config.label == null) {
	    	GmailApp.createLabel(config.processedMailLabel);
	    	config.label = GmailApp.getUserLabelByName(config.processedMailLabel);
	    }	
	}
    
  return config;
}

/*
 	Main responder function
*/
function autoSMSResponder() {
	var threads     = GmailApp.getInboxThreads(parseInt(config.inboxStartingPoint), parseInt(config.maxMessageCheck));
	var messages    = GmailApp.getMessagesForThreads(threads);
	var messageBody = '';
	var messageFrom = '';

	try {
		for (var i = 0 ; i < messages.length; i++) {
			for (var j = 0; j < messages[i].length; j++) {
				if(messages[i][j].isUnread()) {      
					messageBody = messages[i][j].getPlainBody();
					messageFrom = messages[i][j].getFrom();

					switch(messageBody.replace(/\s+/g, ' ').trim().toLowerCase()) {
						case "menu":
						case "help":
						case "start":
							sendIntroMessage(messageFrom);
						break;

						case "1":
						case "directions":
						case "dir":
							sendDirections(messageFrom);
						break;

						case "2":
						case "wifi":
						case 'wireless':
							sendWifiInfo(messageFrom);
						break;

						case "3":
						case "contact":
						case "poc":
							sendContactInfo(messageFrom);
						break;

						case "4":
						case "piture":
						case "cat":
							sendReplyImage(messageFrom);
						break;

						default:
							//optional, if you want this to only respond to specific commands, comment this out.
							sendIntroMessage(messageFrom); 
						break;
					}
				  
					messages[i][j].markRead();
				}
			}
		}

		if (config.archiveMessages) {
			config.label.addToThreads(threads);
			GmailApp.moveThreadsToArchive(threads);
		}
	}

	catch (err) {
		generateError(parameterOptions=arguments, errorMessage=err);
	}
}

/*
	Main handler to send SMS messages
*/
function sendSMSReply(messageTo, messageBody) {
	try {
		messageTo 	= (typeof messageTo 	=== 'undefined') ? '' : messageTo;
		messageBody = (typeof messageBody 	=== 'undefined') ? '' : messageBody;

		if(messageTo.length > 0 && messageBody.length > 0) {
			GmailApp.sendEmail(messageTo, config.headerTitle, messageBody);	
		}
		else {
			throw 'SMS message parameters are invalid';
		}
	}

	catch (err) {
		generateError(parameterOptions=arguments, errorMessage=err);
	}	
}

/*
	Main handler to send MMS messages
		Notes: 
				- gDrive image needs to be public for this to work.
				- gDriveImage needs to come in with a fully qualifying file name, ex: meep.jpg
				- MMS msg comes from a different address on the response, noReply was added. Annoying.
*/
function sendMMSImage(messageTo, gDriveImage, messageBody) {
	var picture = '';
	var file 	= '';

	try {
		messageTo 	= (typeof messageTo 	=== 'undefined') ? '' : messageTo;
		gDriveImage = (typeof gDriveImage 	=== 'undefined') ? '' : gDriveImage;
		MessageBody = (typeof MessageBody 	=== 'undefined') ? '' : MessageBody;

		if(messageTo.length > 0 && gDriveImage.length > 0 && messageBody.length > 0) {
			picture = DriveApp.getFilesByName(gDriveImage);

			while (picture.hasNext()) {
		      file = picture.next();
		      GmailApp.sendEmail(messageTo, config.headerTitle, messageBody, {attachments: file.getBlob(), noReply: true});
		    }
		}
		else {
			throw 'MMS message parameters are invalid';
		}
	}

	catch (err) {
		generateError(parameterOptions=arguments, errorMessage=err);
	}
}

function generateError(parameterOptions, errorMessage) {
	// currently does nothing, it could email you, log, etc.
	// Logger.log(parameterOptions);
	// Logger.log(errorMessage);
}

/* 
	customized functions
*/
function sendIntroMessage(messageTo) {
	sendSMSReply(messageTo=messageTo, messageBody=config.introMsg);
}

function sendContactInfo(messageTo) {
	sendSMSReply(messageTo=messageTo, messageBody=config.headerTitle + ' contact info :: ' + config.contactInfo);
}

function sendWifiInfo(messageTo) {
	sendSMSReply(messageTo=messageTo, messageBody=config.headerTitle + ' wifi :: ' + config.wifiSSID + ' - key: ');
	// send a second SMS, makes it easier to copy and paste text
	sendSMSReply(messageTo=messageTo, messageBody=config.wifiKey);
}

function sendDirections(messageTo) {
	sendSMSReply(messageTo=messageTo, messageBody=config.headerTitle + ' address :: ' + config.locationAddress);
}

function sendReplyImage(messageTo) {
	sendMMSImage(messageTo=messageTo, gDriveImage='test.jpg', messageBody='Optional comment to go with the image');
}