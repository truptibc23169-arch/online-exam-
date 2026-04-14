require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("Missing MONGODB_URI");
}

const client = new MongoClient(mongoUri);
const dbName = process.env.DB_NAME || "online_exam";
let usersCollection;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const existingUser = await usersCollection.findOne({ email: emailNormalized });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await usersCollection.insertOne({
      name: String(name).trim(),
      email: emailNormalized,
      passwordHash,
      createdAt: new Date()
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: { name: String(name).trim(), email: emailNormalized }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const user = await usersCollection.findOne({ email: emailNormalized });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

async function start() {
  try {
    await client.connect();
    usersCollection = client.db(dbName).collection("users");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
