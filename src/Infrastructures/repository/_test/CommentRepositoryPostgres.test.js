const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should should throw NotFoundError if thread is invalid', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'a thread comment',
      });
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      const invalidThreadId = 'thread-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(commentRepositoryPostgres.addComment(addComment, invalidThreadId, fakeUserId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should persist data from addComment object in database', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'a thread comment',
      });
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await commentRepositoryPostgres.addComment(addComment, fakeThreadId, fakeUserId);

      // Assert
      const fetchedCommentById = await ThreadCommentsTableTestHelper.findCommentById('comment-123');
      expect(fetchedCommentById).toHaveLength(1);
    });

    it('should return added thread data correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'a thread comment',
      });
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres
        .addComment(addComment, fakeThreadId, fakeUserId);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'a thread comment',
        owner: 'user-123',
      }));
    });
  });

  describe('removeCommentById function', () => {
    it('should remove comment if request is valid', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
      );

      // Action
      await commentRepositoryPostgres.removeCommentById(fakeThreadId, fakeCommentId, fakeUserId);

      // Assert
      const fetchedCommentById = await ThreadCommentsTableTestHelper.findCommentById('comment-123');
      expect(fetchedCommentById[0].is_deleted).toEqual(true);
    });

    it('should throw NotFoundError if thread id is invalid', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      const invalidThreadId = 'thread-invalid';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(commentRepositoryPostgres.removeCommentById(
        invalidThreadId,
        fakeCommentId,
        fakeUserId,
      ))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError if comment id is invalid', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const invalidCommentId = 'comment-invalid';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      expect(commentRepositoryPostgres.removeCommentById(
        fakeThreadId,
        invalidCommentId,
        fakeUserId,
      ))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError if userId does not match comment owner', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const otherFakeUserId = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
      await ThreadCommentsTableTestHelper.addComment({
        id: fakeCommentId,
        threadId: fakeThreadId,
        owner: fakeUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        {},
      );

      // Action & Assert
      expect(commentRepositoryPostgres
        .removeCommentById(fakeThreadId, fakeCommentId, otherFakeUserId))
        .rejects
        .toThrowError(AuthorizationError);
    });

    describe('getCommentsByThreadId function', () => {
      it('should return comments data correctly', async () => {
        // Arrange
        const fakeThreadId = 'thread-123';
        const fakeCommentIdA = 'comment-123';
        const fakeCommentIdB = 'comment-456';
        // B's comment goes ahead of A's comment
        const fakeDateCommentB = new Date(100).toISOString();
        const fakeDateCommentA = new Date(1000).toISOString();
        const fakeUserId = 'user-123';
        const fakeUsername = 'fake_user';

        await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
        await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });
        await ThreadCommentsTableTestHelper.addComment({
          id: fakeCommentIdA,
          threadId: fakeThreadId,
          owner: fakeUserId,
          date: fakeDateCommentA,
        });
        await ThreadCommentsTableTestHelper.addComment({
          id: fakeCommentIdB,
          threadId: fakeThreadId,
          owner: fakeUserId,
          date: fakeDateCommentB,
        });
        await ThreadCommentsTableTestHelper.removeCommentById(fakeCommentIdB);
        const commentRepositoryPostgres = new CommentRepositoryPostgres(
          pool,
          {},
        );

        // Action
        const threadComments = await commentRepositoryPostgres.getCommentsByThreadId(fakeThreadId);

        // Assert
        expect(threadComments).toStrictEqual([
          new CommentDetail({
            id: 'comment-456',
            username: 'fake_user',
            date: fakeDateCommentB,
            replies: [],
            content: '**komentar telah dihapus**',
          }),
          new CommentDetail({
            id: 'comment-123',
            username: 'fake_user',
            date: fakeDateCommentA,
            replies: [],
            content: 'a thread comment',
          }),
        ]);
      });
    });
  });
});
