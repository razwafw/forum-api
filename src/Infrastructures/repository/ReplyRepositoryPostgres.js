const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
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

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT comment_replies.id, comment_replies.content, comment_replies.date, users.username, comment_replies.is_deleted
             FROM comment_replies 
             LEFT JOIN users
             ON comment_replies.owner = users.id
             WHERE comment_replies.comment_id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async removeReplyById(threadId, commentId, replyId, userId) {
    await this._verifyReplyAccess(threadId, commentId, replyId, userId);

    const query = {
      text: 'UPDATE comment_replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async _verifyCommentExistence(threadId, commentId) {
    const query = {
      text: 'SELECT id FROM thread_comments where id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar atau thread invalid');
    }
  }

  async _verifyReplyAccess(threadId, commentId, replyId, userId) {
    const query = {
      text: `SELECT comment_replies.owner 
             FROM comment_replies
             LEFT JOIN thread_comments
             ON comment_replies.comment_id = thread_comments.id
             WHERE comment_replies.id = $1 AND comment_replies.comment_id = $2 AND thread_comments.thread_id = $3`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan yang ingin dihapus invalid');
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda bukan pemilik balasan tersebut');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
