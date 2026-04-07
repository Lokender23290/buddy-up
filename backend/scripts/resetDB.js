const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = Object.keys(mongoose.connection.collections);
        
        console.log(`\n-----------------------------------`);
        console.log(`BUDDYUP IDENTITY PURGE INITIATED`);
        console.log(`-----------------------------------\n`);
        
        for (const collectionName of collections) {
            await mongoose.connection.collections[collectionName].deleteMany({});
            console.log(`CLEARED: ${collectionName}`);
        }
        
        console.log(`\nSUCCESS: Identity Sync Vault Reset Complete. Fresh Synchronization Required.`);
        process.exit(0);
    } catch (error) {
        console.error('FATAL: Database reset failure:', error.message);
        process.exit(1);
    }
};

clearDatabase();
