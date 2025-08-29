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

app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ message: "Image trop volumineuse (max 2 Mo)" });
  }
  if (err?.message && err.message.includes("Type de fichier non autorisé")) {
    return res.status(400).json({ message: "Type d’image non autorisé" });
  }

  res
    .status(500)
    .json({ message: "Erreur lors de l’upload", error: err?.message });
});

module.exports = app;
