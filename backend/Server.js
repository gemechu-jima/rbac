import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ROLE_PERMISSIONS } from "./role.js";


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

app.post("/users", async (req, res) => {
  const { name, email, role } = req.body;

  const permissions = ROLE_PERMISSIONS[role];

  const newUser = {
    name,
    email,
    role,
    permissions, // ✅ attach permissions here
  };

  res.json(newUser);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const port = process.env.PORT || 5000;
const IP = process.env.IP || "localhost";

app.listen(port, IP, () => {
  console.log(`Server running at http://${IP}:${port}`);
});
