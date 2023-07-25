const mongoose = require('mongoose')
const schema = require('../schema/schema')
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
mongoose.connection.setMaxListeners(50);

class UserDB{
    constructor(){
      this.mongod = null;
      this.init();
    }

    async init(){
      try {
        this.mongod = await MongoMemoryServer.create();
      } catch (error) {
        throw error;
      }
    }

    getServerUri() {
      if (!this.mongod) {
        throw new Error('MongoDB memory server has not been started.');
      }
      return this.mongod.getUri();
    }
  

   async connectDB(){
      const uri = this.getServerUri();
        mongoose.connect(uri,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        const dbConnection = mongoose.connection
        dbConnection.on('error',(err)=>{
            console.error("Connection Error",err)
        })
        return dbConnection
    }

    async createUser(name,description,mbti,enneagram,variant,tritype,socionics,sloan,psyche,image){
        try {
           let connection = await this.connectDB();
           const userModel = connection.model("User",schema.userSchema)
           let lastDoc = await userModel.findOne({},{},{sort:{createdAt:-1}})
           let id = 1;
           if(lastDoc)
           id = lastDoc.id+1; //If I will implement the autoincrement directly, in future it will create the race condition thats why I am using the last doc as last resort
           const user = new userModel({id,name,description,mbti,enneagram,variant,tritype,socionics,sloan,psyche,image})
           await user.save()
         //  connection.destroy();
           return {response:true};
        }
        catch(err){
            console.log(err); //before production we have to decide the error handling strategy 
            return {response:false,message:"Server Error",code:500};
        }
    }

    async createPost(title,description,mediaFile,postedBy){
        try {
           let connection = await this.connectDB();
           const postModel = connection.model("Post",schema.postSchema)
           let lastDoc = await postModel.findOne({},{},{sort:{createdAt:-1}})
           let id = 1;
           if(lastDoc)
           id = lastDoc.id+1;
           const post = new postModel({id,title,description,mediaFile,postedBy})
           await post.save()
           return {response:true};
        }
        catch(err){
            console.log(err);
            return {response:false,message:"Server Error",code:500};
        }
    }

    async createComment(title,description,mbti,enneagram,variant,commentedBy,commentedOn,commentType){
        try {
            let connection = await this.connectDB();
            const commentModel = connection.model("Comment",schema.commentSchema)
            let lastDoc = await commentModel.findOne({},{},{sort:{createdAt:-1}})
            let id = 1;
            let likes  = [];
            if(lastDoc)
            id = lastDoc.id+1;
            const comment = new commentModel({id,title,description,mbti,enneagram,variant,commentedBy,commentedOn,commentType,likes})
            await comment.save()

            return {response:true};
         }
         catch(err){
             console.log(err);
             return {response:false,message:"Server Error",code:500};
         }
    }
/*
    async createVote(title,description,voteOn,createdBy){
        try {
           let connection = await this.connectDB();
           const voteModel = connection.model("Vote",schema.voteSchema)
           let lastDoc = await voteModel.findOne({},{},{sort:{createdAt:-1}})
           let id = 1;
           if(lastDoc)
           id = lastDoc[0].id+1;
           let inFavour = []
           let inOdds = []
           const vote = new voteModel({id,title,description,voteOn,createdBy,inFavour,inOdds})
           await vote.save()
           connection.destroy();
           return {reponse:true};
        }
        catch(err){
            console.log(err);
            return {response:false,message:"Server Error",code:500};
        }
    }
*/
    async like(id, userId) {
        try {
          const connection = await this.connectDB();
          const commentModel = connection.model("Comment", schema.commentSchema);
          const data = await commentModel.findOne({ id });
      
          if (!data) {
            return { response: false, message: "Incorrect ID Data Not Found", code: 404 };
          }
      
          const isLiked = data.likes.includes(userId);
          const updateData = isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } };
          const response = await commentModel.findOneAndUpdate({ id }, updateData, { new: true });
          if (response) {
            return { response: true };
          } else {
            return { response: false, message: "Error Occurred", code: 500 };
          }
        } catch (err) {
          console.log(err);
          return { response: false, message: "Error Occurred", code: 500 };
        }
      }
      
/*
      async casteVote(id, userId, type) {
        try {
          const connection = await this.connectDB();
          const voteModel = connection.model("Vote", schema.voteSchema);
          const data = await voteModel.findOne({ id });
      
          if (!data) {
            return { response: false, message: "Incorrect ID Data Not Found", code: 404 };
          }
      
          const isLikedInFavour = data.inFavour.includes(userId);
          const isLikedInOdds = data.inOdds.includes(userId);
          let response;
      
          if (type === true) {
            response = isLikedInOdds
              ? await voteModel.findOneAndUpdate({ id }, { $pull: { inOdds: userId }, $push: { inFavour: userId } }, { new: true })
              : await voteModel.findOneAndUpdate({ id }, { $push: { inFavour: userId } }, { new: true });
          } else if (type === false) {
            response = isLikedInFavour
              ? await voteModel.findOneAndUpdate({ id }, { $pull: { inFavour: userId }, $push: { inOdds: userId } }, { new: true })
              : await voteModel.findOneAndUpdate({ id }, { $push: { inOdds: userId } }, { new: true });
          } else {
            return { response: false, message: "Invalid Input", code: 400 };
          }
          await connection.destroy();

          if (response) {
            return { response: true };
          } else {
            return { response: false, message: "Error Occurred", code: 500 };
          }
        } catch (err) {
          console.log(err);
          return { response: false, message: "Error Occurred", code: 500 };
        }
      }
  */    
    async checkUserId(id){
        try{
            const connection = await this.connectDB();
            const userModel = connection.model("User",schema.userSchema);
            let count = await userModel.countDocuments({id});
            if(!count || count ==  0){
                return false;
            }
            else{
                return true;
            }
        }
        catch(err){
            console.log(err);
            return err;
        }
    }
    async checkCommentId(id){
        try{
            const connection = await this.connectDB();
            const commentModel = connection.model("Comment",schema.userComment);
            let count = await commentModel.countDocuments({id});
            if(!count || count ==  0){
                return false;
            }
            else{
                return true;
            }
        }
        catch(err){
            console.log(err);
            return err;
        }
    }

    async checkPostId(id){
        try{
            const connection = await this.connectDB();
            const postModel = connection.model("Post",schema.postComment);
            let count = await postModel.countDocuments({id});
            if(!count || count ==  0){
                return false;
            }
            else{
                return true;
            }
        }
        catch(err){
            console.log(err);
            return err;
        }
    }

    /*async checkVoteId(id){
        try{
            const connection = await this.connectDB();
            const postModel = connection.model("Vote",schema.postComment);
            let count = postModel.countDocuments({id});
            connection.destroy();
            if(!count || count ==  0){
                return false;
            }
            else{
                return false;
            }
        }
        catch(err){
            console.log(err);
            return err;
        }
    }
*/
    async getusers(){
        try{
            const connection = await this.connectDB();
            const userModel = connection.model("User",schema.userSchema);
            const data = await userModel.find({},{id:1,name:1,title:1,description:1,mbti:1,enneagram:1,variant:1,tritype:1,socionics:1,sloan:1,psyche:1,image:1})
            //connection.destroy();
            if(!data)
            return {response:false,message:"Error Occured",code:500}
            return {response:true,data}
        }
        catch(err){
          console.log(err);
          return { response: false, message: "Error Occurred", code: 500 };
        }
    }

    async getuser(id){
        try{
            const connection = await this.connectDB();
            const userModel = connection.model("User",schema.userSchema);
            const data = await userModel.findOne({id},{id:1,name:1,title:1,description:1,mbti:1,enneagram:1,variant:1,tritype:1,socionics:1,sloan:1,psyche:1,image:1})
            connection.destroy();
            if(!data)
            return {response:false,message:"Error Occured",code:500}
            return {response:true,data}
        }
        catch(err){
          console.log(err);
          return { response: false, message: "Error Occurred", code: 500 };
        }
    }

    async getComments(filter, type) {
      try {
        const connection = await this.connectDB();
        const commentModel = connection.model("Comment", schema.commentSchema);
        
        const pipeline = [
          { $match: filter },
          {
            $project: {
              id: 1,
              title: 1,
              description: 1,
              mbti: 1,
              enneagram: 1,
              variant: 1,
              commentedBy: 1,
              commentedOn: 1,
              commentType: 1,
              createdAt: 1,
              likesCount: { $size: '$likes' },
            },
          },
          ...(type
            ? [
                { $sort: { likesCount: -1 } },
              ]
            : [
              {$sort:{createdAt:-1}}
            ]),
          {
            $lookup: {
              from: 'users',
              localField: 'commentedBy',
              foreignField: 'id',
              as: 'user',
            },
          },
        ]; 
        
    
        const data = await commentModel.aggregate(pipeline);
        return { response: true, data };
      } catch (err) {
        console.log(err);
        return { response: false, message: "Error Occurred", code: 500 };
      }
    }
    
      

 /*   async getVote(id){
        try{
            const connection = await this.connectDB();
            const voteModel = connection.model("Vote",schema.voteSchema);
            const data = await voteModel.find({id})
            if(!data)
            return {response:false,message:"Error Occured",code:500}
            return {response:true,data}
        }
        catch(err){
          console.log(err);
          return { response: false, message: "Error Occurred", code: 500 };
        }
    }
*/
}

module.exports = new UserDB();