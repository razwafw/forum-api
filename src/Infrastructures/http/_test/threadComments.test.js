const pool = require('../../database/postgres/pool');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persists thread comment', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const requestPayload = {
        content: 'a thread comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when request does not include required authetication', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const requestPayload = {
        content: 'a thread comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
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
      const fakeThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const requestPayload = {};
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
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

    it('should respond 404 when thread id is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const invalidThreadId = 'thread-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const requestPayload = {
        content: 'a thread comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and remove thread comment', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('komentar berhasil dihapus');
    });

    it('should response 401 when request does not include required authetication', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should respond 404 when comment is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const invalidCommentId = 'comment-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeUsername,
        id: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${invalidCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });

    it('should respond 403 when comment is deleted by unauthorized user', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeOtherUserId = 'user-456';
      const fakeUsername = 'fake_user';
      const fakeOtherUsername = 'fake_other_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: fakeOtherUsername,
        id: fakeOtherUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(typeof responseJson.message).toBe('string');
      expect(responseJson.message).not.toEqual('');
    });
  });
});
