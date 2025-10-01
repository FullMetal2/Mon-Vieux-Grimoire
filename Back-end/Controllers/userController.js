const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/user");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créer !" }))
        .catch((error) => {
          console.error("Erreur user", error);
          return res.status(400).json({ error });
        });
    })
    .catch((error) => {
      console.error("Erreur lors de la création de user :", error);
      return res.status(500).json({ error });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Login/mot de passe incorrecte" });
      }

      return bcrypt.compare(req.body.password, user.password).then((valid) => {
        if (!valid) {
          res.status(401).json({ message: "Login/mot de passe incorrecte" });
        }
        res.status(200).json({
          userId: user._id,
          token: jwt.sign({ userId: user._id }, process.env.TOKEN, {
            expiresIn: "24h",
          }),
        });
      });
    })
    .catch((error) => {
      console.error("[LOGIN] error:", error);
      return res.status(500).json({ error });
    });
};
