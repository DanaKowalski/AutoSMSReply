# AutoSMSReply
Free auto SMS reply program.

Requirements
================
 1. Google Voice Number
 2. Gmail Address, associated with the Voice number above.
 3. Google Script
 
 
Installation
================
1. In the Google Voice account, navigate to Settings -> Voicemail & Text.
2. Select the option: Text Forwarding - Forward text messages to my email: (ensure email is the GMail address you want to use).
3. Navigate to Google Scripts, copy the SMSAutoReply.gs to a new script file, and save the file.
4. Configure the init() function to the details you want the auto responder to use for message processing.
5. Navigate, in Google Scripts, to the Resources -> Current project's triggers menu.
6. Add a new trigger, select the 'AutoSMSResponder' function as the run function, select thew time-driven option, and the frequency you want the cron job equivalent to run. Note: The lowest time you can run is every one minute.
7. Save the trigger.
8. (optional) In GMail, create a label for the config.gmailLabel you setup in the .gs file. Note: the script auto creates this label, if you opt to archive messages.
9. Send a text to the voice number, and this should now start responding.
