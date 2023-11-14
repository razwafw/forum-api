const pool = require('../../database/postgres/pool');
const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

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

  describe('when GET /threads/{threadId}', () => {
    afterEach(async () => {
      await CommentRepliesTableTestHelper.cleanTable();
      await ThreadCommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should respond 200 and return correct thread data', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';
      const fakeThreadId = 'thread-123';
      const fakeCommentIdA = 'comment-123';
      const fakeCommentIdB = 'comment-456';
      const fakeReplyIdA = 'reply-123';
      const fakeReplyIdB = 'reply-456';
      const fakeReplyIdC = 'reply-789';
      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentIdA,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentIdB,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyIdA,
        commentId: fakeCommentIdA,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyIdB,
        commentId: fakeCommentIdA,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyIdC,
        commentId: fakeCommentIdB,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.removeReplyById(fakeReplyIdB);
      await ThreadCommentsTableTestHelper.removeCommentById(fakeCommentIdB);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${fakeThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });
  });
});
