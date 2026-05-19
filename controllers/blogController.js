const Blog = require("../models/blog");

const defaultCategories = ["General", "Technology", "Travel", "Food", "Lifestyle", "Art"];

const getCategoryOptions = async () => {
  const categories = await Blog.distinct("category");
  return [...new Set([...defaultCategories, ...categories.filter(Boolean)])].sort();
};

exports.getAllBlogs = async (req, res) => {
  const { q = "", category = "" } = req.query;
  const filter = {};

  if (q.trim()) {
    const search = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: search },
      { content: search },
      { author: search },
      { category: search },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const [blogs, categories] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }),
    getCategoryOptions(),
  ]);

  res.render("index", { blogs, categories, filters: { q, category } });
};


exports.getNewForm = async (req, res) => {
  const categories = await getCategoryOptions();
  res.render("new", { categories });
};


exports.createBlog = async (req, res) => {
  const { title, content, category } = req.body;

  const image = req.file ? req.file.filename : null;

  await Blog.create({
    title,
    content,
    author: req.currentUser.username,
    category: category || "General",
    image,
    owner: req.currentUser._id,
  });

  res.redirect("/");
};


exports.getSingleBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  const canManage =
    req.currentUser && (!blog.owner || blog.owner.toString() === req.currentUser._id.toString());

  res.render("show", { blog, canManage });
};


exports.getEditForm = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  const categories = await getCategoryOptions();

  if (blog.owner && blog.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect(`/blogs/${blog._id}`);
  }

  res.render("edit", { blog, categories });
};


exports.updateBlog = async (req, res) => {
  const { title, content, category } = req.body;
  const blog = await Blog.findById(req.params.id);

  if (blog.owner && blog.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect(`/blogs/${blog._id}`);
  }

  const updateData = { title, content, category: category || "General" };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  await Blog.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/");
};


exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (blog && (!blog.owner || blog.owner.toString() === req.currentUser._id.toString())) {
    await Blog.findByIdAndDelete(req.params.id);
  }

  res.redirect("/");
};
