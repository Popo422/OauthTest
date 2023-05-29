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

const PORT = 4000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let refreshTokens = []; // note the refrestoken is typically stored in a database sumwhere tapos checheknatin kung ung nagenerate na refresh token is existing na ba

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
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

app.post("/login", (req, res) => {
  //Authenticate the user
  console.log(req.body);
  const username = req.body.username;
  const user = { name: username };
  console.log(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  res.status(200).json({ accessToken, refreshToken });
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  console.log(refreshToken);
  if (refreshToken == null) {
    return res.status(401).json({ error: "wala kang pinass na token yo" });
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: "wala sa db ung refresh token mo" });
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "something went wrong" });
    const accessToken = generateAccessToken({ name: user.name }); //galing ung user.name sa refresh token na inencrypt mo at pinass dito
    console.log(user.name);
    res.status(201).json({ accessToken });
  });
});
app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.status(201).json({ message: "succesfully removed refreshtoken" });
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
