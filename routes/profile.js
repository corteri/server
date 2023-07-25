'use strict';
const express = require('express');
const router = express.Router();
const db = require('../DB/userdb');
const { urlencoded } = require("body-parser");
router.use(urlencoded({ extended: false }));
router.use(express.json());

router.post("/user", async (req, res) => {

  let {
    name,
    description = "",
    mbti = "",
    enneagram = "",
    variant = "",
    tritype = "",
    socionics = "",
    sloan = "",
    psyche = "",
    image = "https://soulverse.boo.world/images/1.png",
  } = req.body;

  if (!name) {
    return res.status(400).send({ response: false, message: "Name is required" });
  }

  const response = await db.createUser(
    name,
    description,
    mbti,
    enneagram,
    variant,
    tritype,
    socionics,
    sloan,
    psyche,
    image
  );

  if (!response) {
    return res.status(500).send({ response: false });
  } else if (!response.response) {
    return res.status(response.code).send({ response: response.response, message: response.message });
  }

  return res.status(200).send({ response: true });
});

/*
router.post("/post", async (req, res) => {
  let { title, description, mediaFile, postedBy } = req.body;
  if (!title || !postedBy) {
    return res.status(400).send({ response: false, message: "Bad Request" });
  }

  mediaFile = mediaFile || "https://soulverse.boo.world/images/1.png";
  description = description || "";

  const checkUser = await db.checkUserId(postedBy);
  if (checkUser === false) {
    return res.status(400).send({ response: false, message: "User Not Found" });
  } else if (checkUser !== true) {
    return res.status(500).send({ response: false, message: "Internal Server Error" });
  }

  const response = await db.createPost(title, description, mediaFile, postedBy);
  if (!response) {
    return res.status(500).send({ response: false });
  } else if (!response.response) {
    return res.status(response.code).send({ response: response.response, message: response.message });
  }

  return res.status(200).send({ response: true });
});
*/

router.post("/comment", async (req, res) => {
  let {
    title,
    description,
    mbti = "",
    enneagram = "",
    variant = "",
    commentedBy,
    commentedOn,
    commentType,
  } = req.body;

  if (
    !title ||
    !description ||
    !commentedBy ||
    !commentedOn ||
    !commentType
  ) {
    return res.status(400).send({ response: false, message: "Bad Request" });
  }

  const checkUser = await db.checkUserId(commentedBy);
  if (!checkUser) {
    return res.status(400).send({ response: false, message: "Invalid User Id" });
  }

  const checkExists = async (type, id) => {
    switch (type) {
      case "POST":
        return db.checkPostId(id);
      case "USER":
        return db.checkUserId(id);
      case "REPLY":
        return db.checkCommentId(id);
      default:
        return false;
    }
  };

  if (!(await checkExists(commentType, commentedOn))) {
    return res
      .status(400)
      .send({ response: false, message: "commentedOn Id not found" });
  }

  const response = await db.createComment(
    title,
    description,
    mbti,
    enneagram,
    variant,
    commentedBy,
    commentedOn,
    commentType,
  );

  return res
    .status(response.code || 200)
    .send({ response: response.response, message: response.message });
});

router.post("/comment/like", async (req, res) => {
  const { commentId, userId } = req.body;

  if (!commentId || !userId) {
    return res.status(400).send({ response: false, message: "Invalid Data" });
  }

  const isCommentTrue = await db.checkCommentId(commentId);
  if (!isCommentTrue) {
    return res.status(400).send({ response: false, message: "commentId not found" });
  }

  const isUserTrue = await db.checkUserId(userId);
  if (!isUserTrue) {
    return res.status(400).send({ response: false, message: "userId not found" });
  }

  const response = await db.like(commentId, userId);
  return res.status(response.code || 200).send({ response: response.response, message: response.message });
});

/*
router.post("/vote", async (req, res) => {
  let { title, description, createdBy, voteOn = "" } = req.body;

  if (!title || !description || !voteOn || !createdBy) {
    return res.status(400).send({ response: false, message: "Bad Request" });
  }

  const isUserId = await db.checkUserId(createdBy);
  if (!isUserId) {
    return res.status(400).send({ response: false, message: "userId Not Found" });
  }

  if (voteOn) {
    const checkPostId = await db.checkPostId(voteOn);
    if (!checkPostId) {
      return res.status(400).send({ response: false, message: "postId Not Found" });
    }
  }

  const response = await db.createVote(title, description, voteOn, createdBy);
  return res.status(response.code || 200).send({ response: response.response, message: response.message });
});
/*
router.post("/vote/cast", async (req, res) => {
  let { voteId, userId, type } = req.body;

  if (!voteId || !userId) {
    return res.status(400).send({ response: false, message: "Bad Request" });
  }

  if (typeof type !== "boolean" && type !== "") {
    return res.status(400).send({ response: false, message: "Type must be boolean" });
  }

  const isUserId = await db.checkUserId(userId);
  if (!isUserId) {
    return res.status(404).send({ response: false, message: "userId Not Found" });
  }

  const isVoteId = await db.checkVoteId(voteId);
  if (!isVoteId) {
    return res.status(404).send({ response: false, message: "voteId Not Found" });
  }

  const response = await db.casteVote(voteId, userId, type);
  return res.status(response.code || 200).send({ response: response.response, message: response.message });
});
*/
//get apis

router.get("/users",async (req,res)=>{
  const response = await db.getusers();
  if(!response.response)
  return res.status(response.code).send({response:response.response,message:response.message})
  return res.status(200).send({response:response.response,data:response.data})
})

router.get("/user/:userId",async (req,res)=>{
  const userId = req.params.userId;
  if(!userId)
  return res.status(400).send({response:false,message:"Bad Request"});
  const isUserId = await db.checkUserId(userId);
  if(!isUserId)
  return res.status(404).send({response:false,message:"userId not found"});
  const response = await db.getuser(userId);
  if(!response.response)
  return res.status(response.code).send({response:response.response,message:response.message})
  return res.render('profile_template',{profile:response.data});
});

router.get("/comment/:userId", async (req,res)=>{
  const filterOption = req.query.personalityFilter;
  const sortOption = req.query.sortOption;
  const userId = req.params.userId;
  let filter = {};
  let type = false;
  if (!filterOption){
     filter = {commentedOn:userId}
  }
  else if(filterOption == "mbti"){
    filter = {commentedOn:userId,enneagram:"",variant:""}
  }
  else if(filterOption == "enneagram"){
    filter = {commentedOn:userId,mbti:"",variant:""}
  }
  else if(filterOption == "variant"){
    filter = {commentedOn:userId,enneagram:"",mbti:""}
  }

   if(sortOption == "best"){
    type = true;
  }

  const response = await db.getComments(filter,type);
  if(!response.response)
  return res.status(response.code).send({response:response.response,message:response.message})
  return res.status(200).send({response:response.response,data:response.data})

})



module.exports = router



/*
const express = require('express');
const router = express.Router();

const profiles = [
  {
    "id": 1,
    "name": "A Martinez",
    "description": "Adolph Larrue Martinez III.",
    "mbti": "ISFJ",
    "enneagram": "9w3",
    "variant": "sp/so",
    "tritype": 725,
    "socionics": "SEE",
    "sloan": "RCOEN",
    "psyche": "FEVL",
    "image": "https://soulverse.boo.world/images/1.png",
  }
];

*/



module.exports = router;
