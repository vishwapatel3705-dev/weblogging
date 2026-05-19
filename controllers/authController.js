const User = require("../models/user");
const { createSession, destroySession } = require("../middleware/auth");

exports.getRegisterForm = (req, res) => {
  res.render("register", { error: null });
};

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password || password.length < 6) {
      return res.render("register", {
        error: "Choose a username and a password with at least 6 characters.",
      });
    }

    const user = new User({ username });
    user.setPassword(password);
    await user.save();

    createSession(res, user._id);
    res.redirect("/");
  } catch (error) {
    const message =
      error.code === 11000
        ? "That username is already taken."
        : "Could not create your account. Please try again.";

    res.render("register", { error: message });
  }
};

exports.getLoginForm = (req, res) => {
  res.render("login", { error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !user.validatePassword(password)) {
    return res.render("login", { error: "Username or password is incorrect." });
  }

  createSession(res, user._id);
  res.redirect("/");
};

exports.logout = (req, res) => {
  destroySession(req, res);
  res.redirect("/");
};
