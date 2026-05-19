const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get("/register", authController.getRegisterForm);
router.post("/register", authController.register);

router.get("/login", authController.getLoginForm);
router.post("/login", authController.login);

router.post("/logout", authController.logout);

module.exports = router;
