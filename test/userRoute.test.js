const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../app'); // Replace with the path to your Express app
const expect = chai.expect;

describe('POST  /user', function () {
  it('should create a new user and return 200 status code', async function () {
    // Mock the db.createUser function to return a successful response
    const mockCreateUser = sinon.fake.resolves({ response: true });
    sinon.replace(db, 'createUser', mockCreateUser);

    const userData = {
      name: 'John Doe',
      description: 'Sample user description',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      tritype: '4-5-9',
      socionics: 'IEI',
      sloan: 'RIC',
      psyche: 'Yellow',
      image: 'https://example.com/user-image.png',
    };

    // Make the POST request to the /user route
    const response = await request(app).post(' /user').send(userData);

    // Assertions
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ response: true });

    // Restore the original db.createUser function
    sinon.restore();
  });

  it('should return 400 status code and an error message if name is missing', async function () {
    
    const response = await request(app)
      .post(' /user')
      .send({
        description: 'Sample user description',
        mbti: 'INFP',
        enneagram: 'Type 4',
        variant: 'Social',
        tritype: '4-5-9',
        socionics: 'IEI',
        sloan: 'RIC',
        psyche: 'Yellow',
        image: 'https://example.com/user-image.png',
      });
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'Name is required' });
  });

  it('should return 500 status code if db.createUser encounters an error', async function () {

    const mockCreateUser = sinon.fake.resolves({ response: false });
    sinon.replace(db, 'createUser', mockCreateUser);

    const userData = {
      name: 'John Doe',
      description: 'Sample user description',
      mbti: 'INFP',
      enneagram: 'Type 4',
      variant: 'Social',
      tritype: '4-5-9',
      socionics: 'IEI',
      sloan: 'RIC',
      psyche: 'Yellow',
      image: 'https://example.com/user-image.png',
    };

    
    const response = await request(app).post(' /user').send(userData);


    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({ response: false });

    
    sinon.restore();
  });
});

describe('GET  /user/:userId', function () {
  it('should return user data for the specified userId', async function () {
    const mockCheckUserId = sinon.fake.resolves(true);

    const mockGetUser = sinon.fake.resolves({
      response: true,
      data: { id: 1, name: 'John Doe', description: 'User description' },
    });

    sinon.replace(db, 'checkUserId', mockCheckUserId);
    sinon.replace(db, 'getuser', mockGetUser);

    const response = await request(app).get(' /user/123');


    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: { id: 1, name: 'John Doe', description: 'User description' },
    });


    sinon.restore();
  });

  it('should return 400 Bad Request if userId is missing', async function () {
    const response = await request(app).get(' /user/');

    
    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal({ response: false, message: 'Bad Request' });
  });

  it('should return 404 if userId is not found', async function () {

    const mockCheckUserId = sinon.fake.resolves(false);

    sinon.replace(db, 'checkUserId', mockCheckUserId);

    
    const response = await request(app).get(' /user/45');


    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({ response: false, message: 'userId not found' });

    // Restore the original db.checkUserId function
    sinon.restore();
  });   

});

describe('GET  /users', function () {
  it('should return a list of users', async function () {
    // Mock the db.getusers function to return a list of users
    const mockGetUsers = sinon.fake.resolves({
      response: true,
      data: [
        { id: 1, name: 'User 1', description: 'User description 1' },
        { id: 2, name: 'User 2', description: 'User description 2' },
        { id: 3, name: 'User 3', description: 'User description 3' },
      ],
    });

    sinon.replace(db, 'getusers', mockGetUsers);

    
    const response = await request(app).get(' /users');

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      response: true,
      data: [
        { id: 1, name: 'User 1', description: 'User description 1' },
        { id: 2, name: 'User 2', description: 'User description 2' },
        { id: 3, name: 'User 3', description: 'User description 3' },
      ],
    });

    sinon.restore();
  });

  it('should handle errors and return the corresponding response', async function () {
    const mockGetUsersError = sinon.fake.resolves({
      response: false,
      code: 500,
      message: 'Error occurred while fetching users',
    });

    sinon.replace(db, 'getusers', mockGetUsersError);


    const response = await request(app).get(' /users');

    
    expect(response.status).to.equal(500);
    expect(response.body).to.deep.equal({
      response: false,
      message: 'Error occurred while fetching users',
    });

    sinon.restore();
  });

});



