const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
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
});
