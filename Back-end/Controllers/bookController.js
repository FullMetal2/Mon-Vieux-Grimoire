const Book = require("../Models/book");
const fs = require("fs");
const path = require("path");

exports.creatBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé !" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        const filePath = path.join(__dirname, "..", "images", filename);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getoneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getbestBook = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(401).json({ error }));
};

exports.postRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) return res.status(404).json({ message: "Livre non trouvé" });
      if (book.ratings.some((r) => r.userId === req.auth.userId)) {
        return res.status(400).json({ message: "Livre déjà noté !" });
      } else {
        const grade = Number(req.body.rating);

        if (!Number.isFinite(grade)) {
          return res
            .status(400)
            .json({ message: "La note doit être un chiffre" });
        }
        if (grade < 0 || grade > 5) {
          return res
            .status(400)
            .json({ message: "La note doit être comprise entre 0 et 5" });
        }

        book.ratings.push({ userId: req.auth.userId, grade: grade });

        const moyenne = book.ratings.reduce((acc, r) => acc + r.grade, 0);
        book.averageRating = moyenne / book.ratings.length;

        book
          .save()
          .then(() => {
            return res.status(200).json(book);
          })
          .catch((error) => {
            return res.status(500).json({ error });
          });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
