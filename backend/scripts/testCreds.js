const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const testEmail = async () => {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;
    console.log(`Testing with Host: ${EMAIL_HOST}, User: ${EMAIL_USER}`);
    
    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: Number(EMAIL_PORT),
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD,
            },
        });
        await transporter.verify();
        console.log('SUCCESS: Email credentials are valid.');
    } catch (error) {
        console.error('FAILURE:', error.message);
    }
};

testEmail();
