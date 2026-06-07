const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ============================================
// Add your users here
// ============================================
const users = [
	{
		username: 'admin',
		email: 'admin@academix.com',
		password: 'admin123',
		role: 'teacher',
		firstName: 'Admin',
		lastName: 'User',
	},
	{
		username: 'student1',
		email: 'student1@academix.com',
		password: 'student123',
		role: 'student',
		firstName: 'John',
		lastName: 'Doe',
	},
];
// ============================================

async function seed() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDB\n');

		const User = require('../models/User');

		for (const userData of users) {
			// Check if user already exists
			const existing = await User.findOne({ username: userData.username });
			if (existing) {
				console.log(`⏭  "${userData.username}" already exists. Skipping.`);
				continue;
			}

			// Hash password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(userData.password, salt);

			// Insert user
			await User.collection.insertOne({
				username: userData.username,
				email: userData.email,
				password: hashedPassword,
				role: userData.role,
				firstName: userData.firstName,
				lastName: userData.lastName,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			console.log(`✅ Created: ${userData.username} (${userData.role}) — password: ${userData.password}`);
		}

		console.log('\nDone!');
		process.exit(0);
	} catch (error) {
		console.error('Seed error:', error.message);
		process.exit(1);
	}
}

seed();
