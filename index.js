// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const cors = require('cors');
require('dotenv').config();

// Create an Express app
const app = express();
app.use(cors()); // Enable CORS to allow requests from the frontend
app.use(express.json()); // To accept JSON in requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// User schema for storing data
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Telegram user ID
  first_name: String,
  last_name: String,
  username: String,
  points: { type: Number, default: 0 }, // Points
  level: { type: Number, default: 1 },  // Level
  tasks: { type: Array, default: [] }   // Tasks
});

const User = mongoose.model('User', UserSchema);

// API endpoint to save or update user data
app.post('/save-user-data', async (req, res) => {
  try {
    const { id, first_name, last_name, username, points, level, tasks } = req.body;

    // Check if the user already exists
    let user = await User.findOne({ id });
    if (!user) {
      // Create a new user if not found
      user = new User({ id, first_name, last_name, username, points, level, tasks });
      await user.save();
      res.status(200).json({ message: 'User added and data saved successfully' });
    } else {
      // Update user data if already exists
      user.points = points || user.points;
      user.level = level || user.level;
      user.tasks = tasks || user.tasks;
      await user.save();
      res.status(200).json({ message: 'User data updated successfully' });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
});

// Set up Telegraf for the bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Hello! Click the button to open the web app:',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Open App', web_app: { url: 'https://tatle-xsll.vercel.app' } }]
        ]
      }
    }
  );
});

// Launch the bot
bot.launch();
console.log('Bot is running...');

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
