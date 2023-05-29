import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import axios from "axios";
import jwt from "jsonwebtoken";
import passport, { session } from "passport";
import { Strategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";

dotenv.config();

const PORT = process.env.port;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

app.use(
  cookieSession({
    name: "session",
    maxAge: 60 * 1000 * 24,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);
app.use(passport.initialize());

const params = {
  callbackURL: "/auth/google/callback",
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

passport.use(
  new Strategy(params, (accessToken, refreshToken, profile, done) => {
    console.log("GOOGLE PROFILE", profile);
    console.log(accessToken);
    done(null, profile); //if may tama ung accessToken
  })
);

const server = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//fake middleware
const checkIfLoggedIn = (req, res, next) => {
  const isLoggedIn = true; //TODO
  if (!isLoggedIn) {
    return res.status(401), json({ error: "You must login" });
  }
  next();
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

app.get("/auth/logout");

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("redirected by Google");
  }
);

app.get("/failure", (req, res) => {
  return res.send("Failed To Login!");
});

app.get("/secret", checkIfLoggedIn, (req, res) => {
  return res.send("your secret value is 42!");
});

server.listen(PORT, () => {
  console.log("SERVER RUNNING in ", PORT);
});
