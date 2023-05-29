import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";
import jwt from "jsonwebtoken";
dotenv.config();

const PORT = process.env.port;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(' ')[1];
  console.log(token)
  if (token == null) {
    res.status(401).json({ err: "you dont got a token passed yo" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ err: "you dont got access yo" });
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/secret", (req, res) => {
  return res.send("your secret value is 42!");
});

server.listen(PORT, () => {
  console.log("SERVER RUNNING in ", PORT);
});
const posts = [
  {
    username: "Zernie",
    title: "post 1",
  },
  {
    username: "Jim",
    title: "post 2",
  },
];

app.get("/posts", authenticateToken, (req, res) => {
  try {
    res
      .status(200)
      .json(posts.filter((post) => post.username === req.user.name));
  } catch (e) {
    throw new Error(e);
  }
});
async function getUser() {
  try {
    const response = await axios.get("/user?ID=12345");
    console.log(response);
  } catch (error) {
    console.error(error);
  }
} //axios sample
app.get("/google", async (req, res) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: "https://dummyjson.co/products/1",
    });
    res.status(200).send(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});
