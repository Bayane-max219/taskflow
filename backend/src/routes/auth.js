const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email et password requis" });
  if (password.length < 6) return res.status(400).json({ error: "password min 6 caractères" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email déjà utilisé" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, email: user.email });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email et password requis" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Identifiants incorrects" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Identifiants incorrects" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: user.email });
});

module.exports = router;
