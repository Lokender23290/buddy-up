const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedFakeUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buddyup';
    await mongoose.connect(mongoUri);
    
    await User.deleteMany({ email: { $in: ['alex.tech@campus.edu', 'sarah.design@campus.edu'] } });
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const fakeProvider = new User({
      name: 'Alex Developer',
      email: 'alex.tech@campus.edu',
      phone: '+10000000001',
      password: passwordHash,
      emailVerified: true,
      phoneVerified: true,
      bio: 'Senior software engineering student building MERN stack apps. I can help with any backend debugging.',
      branch: 'Computer Science',
      year: 'Senior',
      college: 'Campus Tech',
      isProvider: true,
      hourlyRate: 800,
      providerCategory: 'Tech',
      skills: ['NODE.JS', 'MONGODB', 'REACT', 'SYSTEM DESIGN'],
      interests: ['AI', 'WEB 3.0', 'HACKATHONS']
    });

    const fakeConsumer = new User({
      name: 'Sarah Designer',
      email: 'sarah.design@campus.edu',
      phone: '+10000000002',
      password: passwordHash,
      emailVerified: true,
      phoneVerified: true,
      bio: 'Junior UX/UI Designer looking for a developer buddy to help me bring my Figma prototypes to life.',
      branch: 'Design',
      year: 'Junior',
      college: 'Campus Arts',
      isProvider: false,
      hourlyRate: 0,
      skills: ['FIGMA', 'UI/UX', 'PROTOTYPING'],
      interests: ['POTTERY', 'GRAPHIC DESIGN', 'ART']
    });

    await fakeProvider.save();
    await fakeConsumer.save();

    console.log('✅ Two verified campus buddies have been injected into the network matrix successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed users', error);
    process.exit(1);
  }
};

seedFakeUsers();
