const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../app');
const expect = chai.expect;

describe('POST  /comment/like', function () {
  it('should like a comment and return 200 status code', async function () {

    const mockCheckCommentId = sinon.fake.resolves(true);
    const mockCheckUserId = sinon.fake.resolves(true);
    const mockLike = sinon.fake.resolves({ response: true, message: 'Comment liked successfully' });

    sinon.replace(db, 'checkCommentId', mockCheckCommentId);
    sinon.replace(db, 'checkUserId', mockCheckUserId);
    sinon.replace(db, 'like', mockLike);

    const requestData = {
      commentId: 1,
      userId: 1,
    };


    const response = await request(app).post(' /comment/like').send(requestData);

    // Assertions
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ response: true, message: 'Comment liked successfully' });

    // Restore the original db functions
    sinon.restore();
  });

  it('should return 400 status code and an error message if any required field is missing', async function () {
    // Make the POST request to the /comment/like route with missing required fields
    const response = await request(app).post(' /comment/like').send({
      commentId: 1,
      // Missing: userId
    });

    // Assertions
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'Invalid Data' });
  });

  it('should return 400 status code and an error message if commentId is not found', async function () {
    // Mock the db.checkCommentId function to return false (commentId not found)
    const mockCheckCommentId = sinon.fake.resolves(false);
    sinon.replace(db, 'checkCommentId', mockCheckCommentId);

    const requestData = {
      commentId: 1,
      userId: 1,
    };

    // Make the POST request to the /comment/like route
    const response = await request(app).post(' /comment/like').send(requestData);

    // Assertions
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'commentId not found' });

    // Restore the original db.checkCommentId function
    sinon.restore();
  });

  it('should return 400 status code and an error message if userId is not found', async function () {
    // Mock the db.checkUserId function to return false (userId not found)
    const mockCheckUserId = sinon.fake.resolves(false);
    sinon.replace(db, 'checkUserId', mockCheckUserId);

    const requestData = {
      commentId: 1,
      userId: 56,
    };

    
    const response = await request(app).post(' /comment/like').send(requestData);


    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'userId not found' });

    // Restore the original db.checkUserId function
    sinon.restore();
  });

  it('should return 500 status code if db.like encounters an error', async function () {
    // Mock the db.like function to return an error response
    const mockLike = sinon.fake.resolves({ response: false });
    sinon.replace(db, 'like', mockLike);

    const requestData = {
      commentId: 1,
      userId: 1,
    };


    const response = await request(app).post(' /comment/like').send(requestData);

    
    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({ response: false });
    sinon.restore();
  });
});
