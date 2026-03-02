const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

// Root Route
app.get("/", (req, res) => {
  res.send("Backend is running live");
});

// =========================
// Person Schema
// =========================
const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    default: null
  }
});

const Person = mongoose.model("Person", PersonSchema);

// =========================
// Create Person
// =========================
app.post("/api/people", async (req, res) => {
  try {
    const person = await Person.create(req.body);
    res.json(person);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create person" });
  }
});

// =========================
// Get Children
// =========================
app.get("/api/people/children/:parentId", async (req, res) => {
  try {
    const { parentId } = req.params;

    let filter = {};

    if (!parentId || parentId === "null") {
      filter.parentId = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid parentId" });
      }

      filter.parentId = parentId;
    }

    const children = await Person.find(filter);
    res.json(children);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch children" });
  }
});

// =========================
// Search
// =========================
app.get("/api/people/search/:name", async (req, res) => {
  try {
    const people = await Person.find({
      name: { $regex: req.params.name, $options: "i" }
    });

    res.json(people);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// =========================
// Test Route
// =========================
app.get("/test-route", (req, res) => {
  res.json({ message: "Test route working" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});