const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const sendTestSms = async () => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, USER_PHONE } = process.env;
    const target = USER_PHONE || '+918180915344';
    
    console.log(`\n-----------------------------------`);
    console.log(`TWILIO REAL-TIME DISPATCH TEST`);
    console.log(`From: ${TWILIO_PHONE_NUMBER}`);
    console.log(`To: ${target}`);
    console.log(`-----------------------------------`);
    
    try {
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        const message = await client.messages.create({
            body: 'BuddyUp: Real-time Identity Sync Test. If you see this, your SMS channel is 100% active.',
            from: TWILIO_PHONE_NUMBER,
            to: target
        });
        console.log(`\nSUCCESS! SMS Dispatched. SID: ${message.sid}`);
        console.log(`Status: ${message.status}`);
    } catch (error) {
        console.error(`\nFAILURE! Twilio Error Report:\n`);
        console.error(`Error Code: ${error.code}`);
        console.error(`Message: ${error.message}`);
        console.error(`More Info: ${error.moreInfo}`);
    }
};

sendTestSms();
