require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const bookRoute = require("./Routes/bookRoutes");
const bookUser = require("./Routes/userRoutes");

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0`
  )

  .then(() => console.log("Connexion à MongoDB réussie !"))

  .catch((err) => console.error("Connexion à MongoDB échouée !", err));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/books", bookRoute);
app.use("/api/auth", bookUser);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
