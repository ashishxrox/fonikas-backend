require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes')
const forgotPassword = require('./routes/forgotPasswordRoutes')
// const bookingRoutes = require('./routes/bookingRoutes')

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ["http://localhost:5173", "https://foinikas.netlify.app", "https://fonikas-frontend-37jx.vercel.app/"], // Allow frontend origin
  credentials: true // If you're using cookies or sessions
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/pass', forgotPassword);
// app.use('/api/bookings', bookingRoutes)

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
