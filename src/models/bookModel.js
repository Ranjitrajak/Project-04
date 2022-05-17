const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId;

let bookSchema = new mongoose.Schema({
    title: {type:String,trim:true, required:true,unique:true},
    excerpt: {type:String,trim:true, required:true}, 
    userId: {type:ObjectId,trim:true,  required:true, ref:'User'},
    ISBN: {type:String, required:true,trim:true,unique:true},
    category: {type:String,trim:true, required:true,lowercase:true},
    subcategory: [{type:String,trim:true, required:true,lowercase:true}],
    reviews: {type:Number,trim:true, default: 0},
    deletedAt: {type:Date, trim:true, default:null}, 
    isDeleted: {type:Boolean, trim:true,default: false},
    releasedAt: {type: String,trim:true,required:true},
},
    { timestamps: true }
);


module.exports= mongoose.model('Book', bookSchema)