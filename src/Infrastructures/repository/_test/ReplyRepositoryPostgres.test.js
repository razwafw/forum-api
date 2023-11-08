const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentRepliesTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist data from addReply object in database', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'a comment reply',
      });
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await replyRepositoryPostgres.addReply(addReply, fakeThreadId, fakeCommentId, fakeUserId);

      // Assert
      const fetchedReplyById = await CommentRepliesTableTestHelper.findReplyById('reply-123');
      expect(fetchedReplyById).toHaveLength(1);
    });

    it('should return added reply data correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'a comment reply',
      });
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedReply = await replyRepositoryPostgres
        .addReply(addReply, fakeThreadId, fakeCommentId, fakeUserId);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'a comment reply',
        owner: 'user-123',
      }));
    });

    it('should should throw NotFoundError if comment is invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'a comment reply',
      });
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const invalidCommentId = 'comment-invalid';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(replyRepositoryPostgres.addReply(addReply, fakeThreadId, invalidCommentId, fakeUserId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should should throw NotFoundError if thread is invalid', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'a comment reply',
      });
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const invalidThreadId = 'thread-invalid';
      const fakeCommentId = 'comment-123';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(replyRepositoryPostgres.addReply(addReply, invalidThreadId, fakeCommentId, fakeUserId))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
