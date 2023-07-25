const mongoose = require("mongoose")

class Schema{
    constructor(){}
     userSchema = new mongoose.Schema({
        id:Number,
        name:String,
        description:String,
        mbti:String,
        enneagram:String,
        variant:String,
        tritype:String,
        socionics:String,
        sloan:String,
        psyche:String,
        image:String,
        createdAt:{
            type:Date,
            default:()=>Date.now(),
            immutable:true,
        }
    });

    commentSchema = new mongoose.Schema({
        id:Number,
        title:String,
        description:String,
        mbti:String,
        enneagram:String,
        variant:String,
        commentedBy:Number, //Usually we use mongodb generated _id  or uuid as an id but in this case I am using id which is an auto incremented object
        commentedOn:String, //this field is to link the comment to the specific commenter
        commentType:String, // comment can be on POST or Reply or on Profile 
        likes:[Number],    //it stores the id of users who liked this specific comment
        createdAt:{
            type:Date,
            default:()=>Date.now(),
            immutable:true,
        }
        });

    voteSchema = new mongoose.Schema({
        id:Number,
        title:String,
        description:String,
        voteOn:Number,
        createdBy:Number,
        inFavour:[Number],
        inOdds:[Number],
        createdAt:{
            type:Date,
            default:()=>Date.now(),
            immutable:true,
        }
    })
    
    postSchema = new mongoose.Schema({
        id:Number,
        title :String,
        description:String,
        mediaFile:String,
        postedBy:Number,
        createdAt:{
            type:Date,
            default:()=>Date.now(),
            immutable:true,
        }
    })
}
module.exports = new Schema()