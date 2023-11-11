const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist data from addThread object in database', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'a thread title',
        body: 'a thread body',
      });
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(addThread, fakeUserId);

      // Assert
      const fetchedThreadById = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(fetchedThreadById).toHaveLength(1);
    });

    it('should return added thread data correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'a thread title',
        body: 'a thread body',
      });
      const fakeIdGenerator = () => '123';
      const fakeUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: fakeUserId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, fakeUserId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a thread title',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread data correctly', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeUsername = 'fake_user';

      await UsersTableTestHelper.addUser({ id: fakeUserId, username: fakeUsername });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, owner: fakeUserId });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
      );

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById(fakeThreadId);

      // Assert
      expect(threadDetail).toStrictEqual(
        new ThreadDetail({
          id: 'thread-123',
          title: 'a thread title',
          body: 'a thread body',
          date: 'Jan 1st, 1970',
          username: 'fake_user',
          comments: [],
        }),
      );
    });
  });
});
