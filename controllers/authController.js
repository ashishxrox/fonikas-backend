const User = require('../models/Users');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username:name });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const existingEmail = await User.findOne({email});
    if(existingEmail) return res.status(400).json({ message: "User Email already exists" });

    // // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 12);

    // // Create the user
    const user = await User.create({ username: name, email, password});

    // // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // You can also set it in a cookie if using httpOnly tokens
    res.cookie("token", token, { httpOnly: true });

    // Return user info + token
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email }, token });
    // res.status(201).json({name})
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    console.log(user)

    const isMatch = await user.comparePassword(password);
    // console.log(await user.comparePassword(password,user.password))
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ user: { username: user.username, email: user.email }, token });
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
