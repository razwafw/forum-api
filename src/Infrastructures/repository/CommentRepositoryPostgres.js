const { DatabaseError } = require('pg');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, threadId, userId) {
    const { content } = addComment;
    const commentId = `comment-${this._idGenerator()}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO thread_comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [commentId, threadId, userId, content, time],
    };

    try {
      const result = await this._pool.query(query);
      return new AddedComment({ ...result.rows[0] });
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new NotFoundError('id thread yang Anda kirim invalid');
      }
      return {};
    }
  }

  async removeCommentById(threadId, commentId, userId) {
    await this._verifyCommentAccess(threadId, commentId, userId);

    const query = {
      text: 'UPDATE thread_comments SET is_deleted = $1 WHERE thread_id = $2 AND id = $3',
      values: [true, threadId, commentId],
    };

    await this._pool.query(query);
  }

  async _verifyCommentAccess(threadId, commentId, userId) {
    const query = {
      text: 'SELECT owner FROM thread_comments where id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar yang ingin dihapus invalid');
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda bukan pemilik komentar tersebut');
    }
  }
}

module.exports = CommentRepositoryPostgres;
