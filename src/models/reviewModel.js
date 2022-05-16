const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId;

let reviewSchema=new mongoose.Schema({

bookId: {type:ObjectId, ref:"Book", required:true,trim:true},
reviewedBy: {type: String,default:'Guest',trim:true},
reviewedAt: {type:Date},
rating: {type:Number, min:1, max:5, required:true,trim:true},
review: {type:String,trim:true},
isDeleted: {type:Boolean, default: false} 
}, {timestamps: true }
)


module.exports= mongoose.model('Review', reviewSchema)