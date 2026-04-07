const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

const testSms = async () => {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    console.log(`Testing with SID: ${TWILIO_ACCOUNT_SID}`);
    
    try {
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();
        console.log('SUCCESS: Twilio credentials are valid.');
    } catch (error) {
        console.error('FAILURE:', error.message);
    }
};

testSms();
