require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5001;

app.use(cors({
  origin: ["http://localhost:5173", "https://fonikas.netlify.app"], // Allow frontend origin
  credentials: true // If you're using cookies or sessions
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
