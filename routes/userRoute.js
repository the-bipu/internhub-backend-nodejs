import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/mainModel.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, phone, fname, lname, college } = req.body;

        // Check if username and email are unique
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Create a new user
        const user = new User({ email, password, fname, lname, phone, college });

        // const token = await user.generateAuthToken();

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        await user.save();
        res.status(200).json({ message: 'User Logged In Succesfully !!' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get the count of all users
router.get('/total-users-count', async (req, res) => {
    try {
        // Count all users in the database
        const userCount = await User.countDocuments();

        res.status(200).json({ count: userCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get all users with their names and all other info
router.get('/all-users', async (req, res) => {
    try {
        // Find all users in the database
        const users = await User.find({}, '-_id');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Fetch user data by username
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by username
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            college: user.college,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        console.log(userData);
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user route
router.put('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const updates = req.body;

        // Find the user by email and update the fields
        const user = await User.findOneAndUpdate({ email }, updates, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user password route
router.put('/update-password/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user route
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find the user by email and delete
        const user = await User.findOneAndDelete({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
