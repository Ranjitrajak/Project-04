
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const { isValidRequestBody, isValid,isValidObjectId } = require("../utilities/validator");


//---CREATE REVIEW FOR BOOKID
    const createReview = async function (req, res) {
     try {
    //==validating bookId(params)==//
        if (!isValidObjectId(req.params.bookId)) { return res.status(400).send({ status: false, message: "Please provide valid Book Id in param." }) }

    //==validating request body==//   
        let data = req.body;
        data["reviewedAt"]=new Date();
        if (!isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Enter data to create a review" }) }

    //==validating bookId(request body)==//
        if (!isValid(data.bookId)) { return res.status(400).send({ status: false, message: "BookId is required" }) }
        if (!isValidObjectId(data.bookId)) { return res.status(400).send({ status: false, message: "Please provide valid Book Id." }) }

    //==validating rating==//
        if (!isValid(data.rating)) { return res.status(400).send({ status: false, message: "Rating is required" }) }
        if (!(data.rating >= 1 && data.rating <= 5)) { return res.status(400).send({ status: false, message: "Rating value should be between 1 to 5" }) }

    //==finding book document & creating review==//
        if ((data.bookId !== req.params.bookId)) { return res.status(400).send({ status: false, message: "Book Id does not match." }) }
        let book = await bookModel.findOne({ _id: data.bookId, isDeleted: false })
        if (!book) { return res.status(400).send({ status: false, message: "No book exist with this id" }) }    
        let createData = await reviewModel.create(data);

    //==updating review in book document==//    
       // let reviewCount=book.reviews
       // reviewCount ++;
        const updateReview = await bookModel.findOneAndUpdate({_id:data.bookId,isDeleted:false},{$inc:{reviews:1 }},{new:true})

    //==destructuring to get only required keys ==// 
        const { title,excerpt ,userId,category,reviews,subcategory,deletedAt,isDeleted, releasedAt,createdAt,updatedAt}=updateReview
        let  details = {  title,excerpt ,userId,category,reviews,subcategory,deletedAt,isDeleted, releasedAt,createdAt,updatedAt}

    //==finding and sending all reviews for book==// 
        let getReview= await reviewModel.find({bookId:data.bookId,isDeleted: false}).select({_id:1,bookId:1,reviewedBy:1,reviewedAt:1,rating:1,review:1})
        details["reviewData"]=createData
        return res.status(201).send({status:true, message:"Book list",data:details})

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//**********************************************************************//

//---DELETE REVIEW FOR BOOKID
    const deleteReview = async function (req, res) {
    try {
    //==validating review Id(params)==//
        let reviewId = req.params.reviewId;
        if (!isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "review Id is not a valid Id" })

    //==validating book Id(params)==//
        let bookId = req.params.bookId
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "Book id is not a valid" })
    
    //==Review delete for deleted book==//
        const deleteBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!deleteBook){
           const updateReview =await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false},{isDeleted:true},{new:true})
        }

    //==Review delete for present book==//
        const updateReview= await reviewModel.findOneAndUpdate({_id:reviewId,bookId:bookId,isDeleted:false},{isDeleted:true},{new:true})
        if (!updateReview) return res.status(404).send({ status: false, message: "review  data not found" })
        
    //==Updating review count in book document==//
       const deleteReviewCount = await bookModel.findOneAndUpdate({_id:bookId},{$inc:{reviews:-1}},{new:true})
       return res.status(200).send({ status: true, message: "Success",data:deleteReviewCount })  

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//**********************************************************************//

module.exports = { createReview, deleteReview }

//**********************************************************************//

const updateReviews = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        if (!isValidObjectId(data.bookId)) { return res.status(400).send({ status: false, message: "You should have put correct book Id in params" }) }
        if (!isValidObjectId(reviewId)) { return res.status(400).send({ status: false, message: "You should have put correct review Id in params" }) }
        let data = req.body;
        if(!isValidRequestBody(data)){return res.status(400).send({status: false, message: "Enter some data for update"})}
        if (!(data.rating >= 1 && data.rating <= 5)) { return res.status(400).send({ status: false, message: "Rating value should be between 1 to 5" }) }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) { return res.status(400).send({ status: false, message: "No book exist with this id" }) }

        let checkReviewId = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReviewId) { return res.status(400).send({ status: false, message: "No review exist with this id" }) }

        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId },
            { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy, reviewedAt: data.reviewAt } }, { new: true })

        let result = {
            bookId: book._id,
            title: book.title,
            excerpt: book.excerpt,
            userId: book.userId,
            category: book.category,
            reviews: book.review,
            releasedAt: book.releasedAt,
            reviewsData: updateReview
        };
        return res.status(200).send({ status: true, message: "Review updated successfully", data: result })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}