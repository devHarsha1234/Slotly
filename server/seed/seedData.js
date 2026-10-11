const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const User = require('../models/User');
const Business = require('../models/Business');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const connectDB = require('../config/db');

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Business.deleteMany();
    await Service.deleteMany();
    await Staff.deleteMany();

    // Create provider user
    const providerUser = await User.create({
      name: 'Provider Admin',
      email: 'provider@slotly.demo',
      phone: '1234567890',
      passwordHash: 'Demo@123',
      role: 'provider'
    });

    // Create customer user
    const customerUser = await User.create({
      name: 'Demo Customer',
      email: 'customer@slotly.demo',
      phone: '0987654321',
      passwordHash: 'Demo@123',
      role: 'customer'
    });

    // Create business
    const business = await Business.create({
      owner: providerUser._id,
      name: 'Slotly Demo Clinic',
      category: 'Health',
      description: 'A demo clinic for Slotly',
      phone: '1234567890',
      address: '123 Demo St'
    });

    // Create services
    const service1 = await Service.create({
      business: business._id,
      name: 'General Consultation',
      description: 'Standard 20m consultation',
      expectedDurationMinutes: 20,
      price: 50
    });

    const service2 = await Service.create({
      business: business._id,
      name: 'Extended Consultation',
      description: 'Detailed 40m consultation',
      expectedDurationMinutes: 40,
      price: 90
    });

    // Create staff
    await Staff.create({
      business: business._id,
      name: 'Dr. Smith',
      email: 'smith@slotly.demo',
      phone: '1111111111',
      role: 'Doctor',
      services: [service1._id, service2._id]
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();
