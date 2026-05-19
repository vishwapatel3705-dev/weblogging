const crypto = require("crypto");
const User = require("../models/user");

const sessions = new Map();
const SESSION_COOKIE = "blog_session";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...value] = cookie.trim().split("=");

    if (name) {
      cookies[name] = decodeURIComponent(value.join("="));
    }

    return cookies;
  }, {});

const attachUser = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const session = sessions.get(cookies[SESSION_COOKIE]);

    req.currentUser = null;

    if (session) {
      req.currentUser = await User.findById(session.userId).select("username");
    }

    res.locals.currentUser = req.currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

const createSession = (res, userId) => {
  const sessionId = crypto.randomBytes(32).toString("hex");

  sessions.set(sessionId, { userId: userId.toString(), createdAt: Date.now() });
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

const destroySession = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  sessions.delete(cookies[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE);
};

const requireAuth = (req, res, next) => {
  if (!req.currentUser) {
    return res.redirect("/login");
  }

  next();
};

module.exports = {
  attachUser,
  createSession,
  destroySession,
  requireAuth,
};
