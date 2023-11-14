const pool = require('../../database/postgres/pool');
const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{replyId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should respond 201 and and persists comment', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const requestPayload = {
        content: 'a comment reply',
      };
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
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
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 when request does not include required authetication', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const requestPayload = {
        content: 'a comment reply',
      };
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should respond 404 when thread is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const invalidThreadId = 'thread-invalid';
      const fakeCommentId = 'comment-123';
      const requestPayload = {
        content: 'a comment reply',
      };
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
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
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments/${fakeCommentId}/replies`,
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

    it('should respond 404 when comment is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const invalidCommentId = 'comment-invalid';
      const requestPayload = {
        content: 'a comment reply',
      };
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
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
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${invalidCommentId}/replies`,
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

    it('should response 400 when request payload is incorrect', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const requestPayload = {};
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
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
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
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

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    afterEach(async () => {
      await CommentRepliesTableTestHelper.cleanTable();
      await ThreadCommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should respond 200 and remove comment reply', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
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
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('balasan berhasil dihapus');
    });

    it('should respond 401 when request does not include required authentication', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should respond 403 when authorization is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const invalidUserId = 'user-invalid';
      const invalidUsername = 'invalid_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const accessToken = await ServerTestHelper.createAccessToken({
        username: invalidUsername,
        id: invalidUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
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

    it('should respond 404 when reply is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const invalidReplyId = 'reply-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
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
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${invalidReplyId}`,
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

    it('should respond 404 when comment is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const invalidCommentId = 'comment-invalid';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
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
        url: `/threads/${fakeThreadId}/comments/${invalidCommentId}/replies/${fakeReplyId}`,
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

    it('should respond 404 when reply is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const invalidThreadId = 'thread-invalid';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
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
        url: `/threads/${invalidThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
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
});
