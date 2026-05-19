const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const { attachUser } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(attachUser);

app.set("view engine", "ejs");

app.use("/", authRoutes);
app.use("/", blogRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
