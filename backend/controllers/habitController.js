const Habit = require("../models/Habit");

const createHabit = async (req, res) => {
  const habit = await Habit.create({
    user: req.user._id,
    title: req.body.title,
  });
  res.status(201).json(habit);
};

const getHabits = async (req, res) => {
  const habits = await Habit.find({ user: req.user._id });
  res.json(habits);
};

const updateHabit = async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  const today = new Date();
  const last = habit.lastCompleted;

  // 🔥 check if same day
  if (
    last &&
    new Date(last).toDateString() === today.toDateString()
  ) {
    return res.json(habit);
  }

  // 🔥 check streak
  if (
    last &&
    new Date(today - last).getDate() === 1
  ) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }

  habit.completed = true;
  habit.lastCompleted = today;

  const updated = await habit.save();
  res.json(updated);
};

const deleteHabit = async (req, res) => {
  const habit = await Habit.findById(req.params.id);
  await habit.deleteOne();
  res.json({ message: "Deleted" });
};

module.exports = {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
};
console.log(createHabit);