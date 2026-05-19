const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const upload = require("../config/multer");
const { requireAuth } = require("../middleware/auth");

router.get("/", blogController.getAllBlogs);
router.get("/new", requireAuth, blogController.getNewForm);

router.post("/blogs", requireAuth, upload.single("image"), blogController.createBlog);

router.get("/blogs/:id", blogController.getSingleBlog);
router.get("/blogs/:id/edit", requireAuth, blogController.getEditForm);

router
  .route("/blogs/:id")
  .put(requireAuth, upload.single("image"), blogController.updateBlog)
  .delete(requireAuth, blogController.deleteBlog);

module.exports = router;
