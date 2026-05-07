const router = require("express").Router();
const Task = require("../models/Task");

router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title required" });
  const task = await Task.create({ title: title.trim() });
  res.status(201).json(task);
});

router.patch("/:id/done", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { done: true },
    { new: true }
  );
  if (!task) return res.status(404).json({ error: "not found" });
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: "not found" });
  res.json({ deleted: true });
});

module.exports = router;
