const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../app');
const expect = chai.expect;

describe('POST  /comment', function () {
  it('should create a new comment and return 200 status code', async function () {

    const mockCheckUserId = sinon.fake.resolves(true);
    const mockCheckPostId = sinon.fake.resolves(true);
    const mockCheckCommentId = sinon.fake.resolves(true);
    const mockCreateComment = sinon.fake.resolves({
      response: true,
      message: 'Comment created successfully',
    });

    sinon.replace(db, 'checkUserId', mockCheckUserId);
    sinon.replace(db, 'checkPostId', mockCheckPostId);
    sinon.replace(db, 'checkCommentId', mockCheckCommentId);
    sinon.replace(db, 'createComment', mockCreateComment);

    const commentData = {
      title: 'Test Comment',
      description: 'This is a test comment',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      commentedBy: 123,
      commentedOn: 'post_id_or_user_id_or_comment_id',
      commentType: 'POST',
    };


    const response = await request(app).post(' /comment').send(commentData);


    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ response: true, message: 'Comment created successfully' });

    
    sinon.restore();
  });

  it('should return 400 status code and an error message if any required field is missing', async function () {
    
    const response = await request(app).post(' /comment').send({
      title: 'Test Comment',
      description: 'This is a test comment',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      commentedBy: 123,
      // Missing: commentedOn, commentType
    });

    // Assertions
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'Bad Request' });
  });

  it('should return 400 status code and an error message if userId is invalid', async function () {

    const mockCheckUserId = sinon.fake.resolves(false);
    sinon.replace(db, 'checkUserId', mockCheckUserId);

    const commentData = {
      title: 'Test Comment',
      description: 'This is a test comment',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      commentedBy: 123,
      commentedOn: 'post_id_or_user_id_or_comment_id',
      commentType: 'POST',
    };

    const response = await request(app).post(' /comment').send(commentData);

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'Invalid User Id' });

   
    sinon.restore();
  });

  it('should return 400 status code and an error message if commentedOn Id is not found', async function () {
   
    const mockCheckPostId = sinon.fake.resolves(false);
    sinon.replace(db, 'checkPostId', mockCheckPostId);

    const commentData = {
      title: 'Test Comment',
      description: 'This is a test comment',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      commentedBy: 123,
      commentedOn: 'invalid_post_id_or_user_id_or_comment_id',
      commentType: 'POST',
    };

  
    const response = await request(app).post(' /comment').send(commentData);

   
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'commentedOn Id not found' });

  
    sinon.restore();
  });

  it('should return 500 status code if db.createComment encounters an error', async function () {
  
    const mockCreateComment = sinon.fake.resolves({ response: false });
    sinon.replace(db, 'createComment', mockCreateComment);

    const commentData = {
      title: 'Test Comment',
      description: 'This is a test comment',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      commentedBy: 123,
      commentedOn: 'post_id_or_user_id_or_comment_id',
      commentType: 'POST',
    };


    const response = await request(app).post(' /comment').send(commentData);

  
    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({ response: false });

    sinon.restore();
  });
});


describe('GET  /comment/:userId', function () {
  it('should return comments for the specified userId with default filter and sorting', async function () {
    
    const mockGetComments = sinon.fake.resolves({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });

    sinon.replace(db, 'getComments', mockGetComments);


    const response = await request(app).get(' /comment/1');

    
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });


    sinon.restore();
  });

  it('should return comments filtered by MBTI', async function () {
    
    const mockGetComments = sinon.fake.resolves({
      response: true,
      data: [{ id: 1, title: 'Comment 1', mbti: 'INTJ' }, { id: 2, title: 'Comment 2', mbti: 'ENTP' }],
    });

    sinon.replace(db, 'getComments', mockGetComments);

  
    const response = await request(app).get(' /comment/1?personalityFilter=MBTI');

    
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: [{ id: 1, title: 'Comment 1', mbti: 'INTJ' }, { id: 2, title: 'Comment 2', mbti: 'ENTP' }],
    });

  
    sinon.restore();
  });

  it('should return comments sorted by recent', async function () {
 
    const mockGetComments = sinon.fake.resolves({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });

    sinon.replace(db, 'getComments', mockGetComments);


    const response = await request(app).get(' /comment/1?sortOption=recent');

    
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });

  
    sinon.restore();
  });

  it('should return comments sorted by best', async function () {

    const mockGetComments = sinon.fake.resolves({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });

    sinon.replace(db, 'getComments', mockGetComments);


    const response = await request(app).get(' /comment/1?sortOption=best');


    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: [{ id: 1, title: 'Comment 1' }, { id: 2, title: 'Comment 2' }],
    });

 
    sinon.restore();
  });



});


