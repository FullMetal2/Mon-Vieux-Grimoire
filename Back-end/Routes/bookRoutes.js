const express = require("express");
const router = express.Router();
const auth = require("../midlleware/auth");
const multer = require("../midlleware/multer-config");

const bookCrtl = require("../Controllers/bookController");

router.post("/", auth, multer, bookCrtl.creatBook);
router.get("/", bookCrtl.getAllBooks);
router.get("/bestrating", bookCrtl.getbestBook);
router.post("/:id/rating", auth, bookCrtl.postRating);
router.put("/:id", auth, multer, bookCrtl.modifyBook);
router.delete("/:id", auth, bookCrtl.deleteBook);
router.get("/:id", bookCrtl.getoneBook);

module.exports = router;
