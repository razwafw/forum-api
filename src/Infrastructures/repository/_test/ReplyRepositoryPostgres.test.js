const CommentRepliesTableTestHelper = require('../../../../tests/CommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
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

  describe('removeReplyById function', () => {
    it('should remove reply if request is valid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action
      await replyRepositoryPostgres.removeReplyById(
        fakeThreadId,
        fakeCommentId,
        fakeReplyId,
        fakeUserId,
      );

      // Assert
      const fetchedReplyById = await CommentRepliesTableTestHelper.findReplyById('reply-123');
      expect(fetchedReplyById[0].is_deleted).toEqual(true);
    });

    it('should throw NotFoundError if thread id is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const invalidThreadId = 'thread-invalid';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action & Assert
      expect(replyRepositoryPostgres.removeReplyById(
        invalidThreadId,
        fakeCommentId,
        fakeReplyId,
        fakeUserId,
      ))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError if comment id is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const invalidCommentId = 'comment-invalid';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action & Assert
      expect(replyRepositoryPostgres.removeReplyById(
        fakeThreadId,
        invalidCommentId,
        fakeReplyId,
        fakeUserId,
      ))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError if reply id is invalid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const invalidReplyId = 'reply-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action & Assert
      expect(replyRepositoryPostgres.removeReplyById(
        fakeThreadId,
        fakeCommentId,
        invalidReplyId,
        fakeUserId,
      ))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError if userId does not match comment owner', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const invalidUserId = 'user-invalid';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyId,
        commentId: fakeCommentId,
        owner: fakeUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action & Assert
      expect(replyRepositoryPostgres.removeReplyById(
        fakeThreadId,
        fakeCommentId,
        fakeReplyId,
        invalidUserId,
      ))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies data correctly', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyIdA = 'reply-123';
      const fakeReplyIdB = 'reply-456';
      const fakeDateReplyB = new Date(100).toISOString(); // B's reply goes ahead of A's reply
      const fakeDateReplyA = new Date(1000).toISOString();
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';

      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyIdA,
        commentId: fakeCommentId,
        owner: fakeUserId,
        date: fakeDateReplyA,
      });
      await CommentRepliesTableTestHelper.addReply({
        id: fakeReplyIdB,
        commentId: fakeCommentId,
        owner: fakeUserId,
        date: fakeDateReplyB,
      });
      await CommentRepliesTableTestHelper.removeReplyById(fakeReplyIdB);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        {},
      );

      // Action
      const commentReplies = await replyRepositoryPostgres.getRepliesByCommentId(fakeCommentId);

      // Assert
      expect(commentReplies).toStrictEqual([
        new ReplyDetail({
          id: 'reply-456',
          content: '**balasan telah dihapus**',
          date: fakeDateReplyB,
          username: 'fake_user',
        }),
        new ReplyDetail({
          id: 'reply-123',
          content: 'a comment reply',
          date: fakeDateReplyA,
          username: 'fake_user',
        }),
      ]);
    });
  });
});
