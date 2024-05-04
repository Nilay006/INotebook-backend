const express = require("express");
const User = require("../models/Users");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../midelware/fetchuser");

const JWT_SECRET = "Nilayisgood12@$";

//Route 1 : Create a user using: post "/api/auth/createuser" No login requared
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("password", "Enter a valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    // if there are errors, return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }
      // Add salt in password
      const salt = await bcrypt.genSalt(10);
      // Change pass word with hash and add salt in password
      const secPass = await bcrypt.hash(req.body.password, salt);
      // Create new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
      // res.json(user);
    } catch (error) {
      console.error(error.massage);
      res.status(500).send("Some Error Occured");
    }
  }
);

// Route 2 : Authenticate a user using: post "/api/auth/login" No login requared

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],

  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ success, authToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Error Occurred");
    }
  }
);

// Route 3 : Get user Information : post "/api/auth/getuser" login requared

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Error Occurred");
  }
});

module.exports = router;
