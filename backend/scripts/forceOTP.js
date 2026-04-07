const mongoose = require('mongoose');
const OTP = require('../models/OTP');
const dotenv = require('dotenv');
dotenv.config();

const forceCode = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const otp = "123456"; // Static test code for identity authorization
        const phone = "9784583174";
        
        await OTP.deleteMany({ identifier: phone });
        await OTP.create({
            identifier: phone,
            type: 'phone',
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        
        console.log(`\n-----------------------------------`);
        console.log(`IDENTITY OVERRIDE INITIATED`);
        console.log(`TARGET: ${phone}`);
        console.log(`MANUAL SYNC CODE: ${otp}`);
        console.log(`-----------------------------------\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('FATAL:', error.message);
        process.exit(1);
    }
};

forceCode();
