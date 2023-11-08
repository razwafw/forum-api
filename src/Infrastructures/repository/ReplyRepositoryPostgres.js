const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply, threadId, commentId, userId) {
    await this._verifyCommentExistence(threadId, commentId);

    const { content } = addReply;
    const replyId = `reply-${this._idGenerator()}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [replyId, commentId, userId, content, time],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async _verifyCommentExistence(threadId, commentId) {
    const query = {
      text: 'SELECT * FROM thread_comments where id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar atau thread invalid');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
