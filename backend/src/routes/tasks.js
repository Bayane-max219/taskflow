const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title required" });
  const task = await Task.create({ title: title.trim(), userId: req.userId });
  res.status(201).json(task);
});

router.patch("/:id/done", async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { done: true },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "not found" });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ error: "not found" });
  res.json({ deleted: true });
});

module.exports = router;
