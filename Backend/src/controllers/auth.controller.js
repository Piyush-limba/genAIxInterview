const User = require("../models/user.model.js");
const TokenBlacklist = require("../models/blacklist.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @name registerUserController
 * @desc register a new user, expects username, email and password in the request body
 * @access Public
 */

const registerUserController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please provide username, email and password",
    });
  }

  const isUserAlreadyExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(409).json({
      message: "User with the same username or email already exists",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      { id: newUser._id, username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Allows cookie to be sent on refresh/navigation
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, options);

    res.status(201).json({
      message: "User registered successfully",
      newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @name loginUserController
 * @desc login a user, expects email and password in the request body
 * @access Public
 */

const loginUserController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    const options = {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Allows cookie to be sent on refresh/navigation
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, options);

    res.status(200).json({
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @name logoutUserController
 * @desc clear token from user cookies and add token to blacklist
 * @access Public
 */

const logoutUserController = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({
      message: "No token found",
    });
  }

  try {
    await TokenBlacklist.create({ token });

    res.clearCookie("token");

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * @name getMeController
 * @desc Get current user information, expects token in the request cookies
 * @access Private
 */

const getMeController = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User information retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
