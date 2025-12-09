import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { ROLE_PERMISSIONS } from "./role.js";
import {ROLE_PERMISSIONS} from "../shares/role.js";
import { client } from "./.config.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Microservices API",
    servicesAvailable: services.length,
  });
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const password = name+12; // 
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }


    if (!ROLE_PERMISSIONS[role]) {
      return res.status(400).json({ error: "Invalid role selected" });
    }

    const permissions = ROLE_PERMISSIONS[role];

    const result = await client.query(
      `INSERT INTO users (name, email, role, password, permissions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, role, password, JSON.stringify(permissions)]
    );

    const savedUser = result.rows[0];

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1", [email]
    );
    const user = result.rows[0];
     if(user.password!==password){
      return res.status(401).json({ message: "Invalid email or password" });
     }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // In a real app, you'd verify the password here
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token: "mock-jwt"
    });
  }
    catch (error) {
      console.error("Login error:", error);
    }
});
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const port = process.env.PORT || 5000;
const IP = process.env.IP || "localhost";

app.listen(port, IP, () => {
  console.log(`Server running at http://${IP}:${port}`);
});
