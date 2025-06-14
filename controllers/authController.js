const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, firstName: user.firstName },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signup = async (req, res) => {
  try {
    const { email, password, lastName, firstName } = req.body;

    const existingEmail = await User.findOne({email});
    if(existingEmail) return res.status(400).json({ message: "User Email already exists" });


    // // Create the user
    const user = await User.create({ firstName, lastName, email, password});

    // // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // You can also set it in a cookie if using httpOnly tokens
    res.cookie("token", token, { httpOnly: true });

    // Return user info + token
    res.status(201).json({ user: { id: user._id, name: user.firstName, email: user.email }, token, message: "Created Succesfully" });
    // res.status(201).json({name})
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    console.log(user)

    const isMatch = await user.comparePassword(password);
    // console.log(await user.comparePassword(password,user.password))
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ user: { firstName: user.firstName, email: user.email }, token, message: "Login Successful" });
    // res.status(200).json({ username, password });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// @route POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // check not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { password } = req.body;
    user.password = password; // Will be hashed via mongoose pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
