
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const { isValidRequestBody, isValid, isValidDate, isValidISBN, isValidObjectId } = require("../utilities/validator");


//---CREATE BOOK
const createBook = async function (req, res) {
    try {
        //==validating request body==//
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, message: "Invalid request, please provide details" })
        let { title, excerpt, userId, ISBN, category, subcategory, isDeleted, releasedAt } = requestBody

        //==validating title==//
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is a mendatory field" })
        let isUniqueTitle = await bookModel.findOne({ title: title })
        if (isUniqueTitle) return res.status(400).send({ status: false, message: `${title} is already exist` })

        //==validating excerpt==//
        if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is a mendatory field" })

        //==validating userId==//
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "UserId is a mendatory field" })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: `${userId}  is not a valid` })
        let isUniqueUserId = await userModel.findOne({ _id: userId })
        if (!isUniqueUserId) return res.status(404).send({ status: false, message: "User not found" })

        //==validating ISBN==//
        if (!isValid(ISBN)) return res.status(400).send({ status: false, msg: "ISBN is a mendatory field" })
        if (!isValidISBN(ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid " })
        let isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
        if (isUniqueISBN) return res.status(400).send({ status: false, message: `${ISBN} is already exist` })

        //==validating category==//   
        if (!isValid(category)) return res.status(400).send({ status: false, message: "category is a mendatory field" })

        //==validating subcategory==//
        if (!isValid(subcategory)) return res.status(400).send({ status: false, message: "subcategory is a mendatory field" })

        //==validating releasedAt==//
        if (!isValid(releasedAt)) return res.status(400).send({ status: false, msg: "releasedAt is mandatory field" })
        if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "Please provide date in YYYY-MM-DD format" })

        //==Creating Book Document==//   
        const bookData = { title, excerpt, userId, ISBN, category, subcategory, isDeleted, releasedAt };
        const saveBook = await bookModel.create(bookData)

        // let result={
        //    _id: saveBook._id,
        //    title:saveBook.title,
        //    excerpt:saveBook.excerpt,
        //    userId:saveBook.userId,
        //    ISBN:saveBook.ISBN,
        //    category:saveBook.category,
        //    subcategory:saveBook.subcategory,
        //    releasedAt:saveBook.releasedAt
        // }

        return res.status(201).send({ status: true, message: "Success", data: saveBook })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}


//**********************************************************************//

//---GET BOOKS BY FILTERS
const getBookList = async function (req, res) {
    try {
        //==getting sorted book-list without query params==//    
        let list = await bookModel.find({ isDeleted: false }).sort({ 'title': 1 })
        if (list.length == 0) { res.status(404).send({ status: false, message: "Books not found" }) }
        if (!req.query)

            return res.status(200).send({ status: true, data: list })

        //==getting sorted book-list with query params==// 
        let userId = req.query.userId
        let category = req.query.category
        let subcategory = req.query.subcategory

        //==validating req parameter==// 
        const filter = { isDeleted: false };

        if (isValid(userId)) {
            if (!isValidObjectId(userId)) {
                return res.status(400).send({ status: false, message: `User id ${userId} is not valid` })
            }
            filter["userId"] = userId;
        }

        if (isValid(category)) {
            filter["category"] = category.toLowerCase();
        }

        if (isValid(subcategory)) {
            let subArr = subcategory.trim().split(',').map(element => element.trim().toLowerCase())
            filter["subcategory"] = { $all: subArr };
        }

        //--finding and sorting books--//
        let booklist = await bookModel.find(filter, { _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, releasedAt: 1 }).sort({ 'title': 1 })

        if (booklist.length == 0) return res.status(404).send({ status: false, message: "Books not found." })

        res.status(200).send({ status: true, message: "Books list", data: booklist })

    } catch (err) { return res.status(500).send({ status: false, message: err.message }) }

}

//**********************************************************************//

//---GET BOOK BY BOOK-ID

const getBookById = async function (req, res) {
    try {
        //==validating bookId==//
        let bookId = req.params.bookId
        if (!isValid(bookId)) return res.status(400).send({ status: false, message: "Book Id Required." })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: `${bookId}  is not a valid.` })


        //==-getting book by book id==//     
        let bookList = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookList) return res.status(404).send({ status: false, message: "Books not found." })

        if (bookList.length==0) return res.status(404).send({ status: false, message: "Books not found." })

        //==destructuring to get only required keys ==// 
        const { title, excerpt, userId, category, reviews, subcategory, deletedAt, isDeleted, releasedAt, createdAt, updatedAt } = bookList
        let details = { title, excerpt, userId, category, reviews, subcategory, deletedAt, isDeleted, releasedAt, createdAt, updatedAt }


        //==finding and sending all reviews for book==// 
        let getReview = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        details["reviewData"] = getReview
        return res.status(200).send({ status: true, message: "Book list", data: details })

    } catch (err) { return res.status(500).send({ status: false, message: err.message }) }
}

//**********************************************************************//

//---UPDATE BOOK BY BOOK-ID
const updateBook = async function (req, res) {
    try {
        //==validating bookId==//
        const bookId = req.params.bookId;
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Not a valid book id" })

        //==validating request body==//
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, message: "No user input to update" })
        let { title, excerpt, releasedAt, ISBN } = requestBody;

        //==validating title==//
        if (title == "") { return res.status(400).send({ status: false, message: "Title is not valid" }) }
        else if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is not valid" })
            const isUniqueTitle = await bookModel.findOne({ title: title })
            if (isUniqueTitle) return res.status(400).send({ status: false, message: `${title} already exist` })
        }

        //==validating excerpt==//
        if (excerpt == "") { return res.status(400).send({ status: false, message: "Excerpt is not valid" }) }
        else if (excerpt) {
            if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is not valid" })
        }

        //==validating Date==//
        if (releasedAt == "") { return res.status(400).send({ status: false, message: "Realease date is not valid" }) }
        else if (releasedAt) {
            if (!isValid(releasedAt)) return res.status(400).send({ status: false, message: "Realease date is not valid" })
            if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "Realease date format is not valid" })
        }

        //==validating ISBN==//
        if (ISBN == "") { return res.status(400).send({ status: false, message: "ISBN is not valid" }) }
        else if (ISBN) {
            if (!isValid(ISBN)) return res.status(400).send({ status: false, message: "ISBN is not valid" })
            if (!isValidISBN(ISBN)) return res.status(400).send({ status: false, message: "ISBN format is not valid" })
            const isUniqueISBN = await bookModel.findOne({ ISBN: ISBN })
            if (isUniqueISBN) return res.status(400).send({ status: false, message: `${ISBN} already exist` })
        }

        //==Updating Book Document==//
        let updtedField = { title, excerpt, releasedAt, ISBN }
        const updateBook = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, updtedField, { new: true })
        if (!updateBook) return res.status(404).send({ status: false, message: "Book not found" })
        return res.status(200).send({ status: true, message: "Success", data: updateBook })
    } catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//************************************************************** ********//

//---DELETE BOOK BY BOOK-ID
const deleteBookData = async function (req, res) {
    try {
        //==validating bookId==//
        let data = req.params.bookId;

        //==Deleting by bookId==//
        const deleteBook = await bookModel.findOneAndUpdate(
            { _id: data, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true })
        if (!deleteBook) return res.status(404).send({ status: false, message: "Book not found" })
        return res.status(200).send({ status: true, message: "Success", data: deleteBook })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//**********************************************************************//

module.exports = { createBook, getBookList, getBookById, deleteBookData, updateBook }

//**********************************************************************//