const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController")
const { createBook, getBookList, getBookById, updateBook, deleteBookData } = require("../controllers/bookController")
const { createReview, deleteReview, updatereview } = require("../controllers/reviewController")
const { authenticateUser, authorization } = require("../middlewares/auth")


//---USER APIS---//
//==Register User
router.post('/register', registerUser)

//==Login User
router.post('/login', loginUser)


//---BOOK APIS---//
//==Create Book Document
router.post('/books', authenticateUser, createBook)

//==Get Book List(with/without query params)
router.get('/books', authenticateUser, getBookList)

//==Get Book by BookId
router.get('/books/:bookId', authenticateUser, getBookById)

//==Update Book by BookId
router.put('/books/:bookId', authenticateUser, authorization, updateBook)

//==Delete Book by BookId
router.delete('/books/:bookId', authenticateUser, authorization, deleteBookData)


//---REVIEW APIS---//
//==Create Review for BookId
router.post('/books/:bookId/review', createReview)

//==Update Review for BookId
router.put('/books/:bookId/review/:reviewId', updatereview)

//==Delete Review for BookId
router.delete('/books/:bookId/review/:reviewId', deleteReview)


module.exports = router;

//*******************************************************************//