const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread, userId) {
    const { title, body } = addThread;
    const threadId = `thread-${this._idGenerator()}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [threadId, userId, title, body, time],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username
             FROM threads 
             LEFT JOIN users
             ON threads.owner = users.id
             WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const threadDetail = new ThreadDetail({
      id: result.rows[0].id,
      title: result.rows[0].title,
      body: result.rows[0].body,
      date: result.rows[0].date,
      username: result.rows[0].username,
    });

    return threadDetail;
  }
}

module.exports = ThreadRepositoryPostgres;
