const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persists thread', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const requestPayload = {
        title: 'a thread title',
        body: 'a thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when request does not include access token', async () => {
      // Arrange
      const requestPayload = {
        title: 'a thread title',
        body: 'a thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload is incorrect', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const requestPayload = {
        title: 123,
        body: 'a thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });
});
