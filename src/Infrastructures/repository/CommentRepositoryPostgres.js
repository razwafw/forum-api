const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

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

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
