const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const fetchedThreadComments = await this._commentRepository
      .getCommentsByThreadId(threadDetail.id);

    const threadComments = await Promise.all(fetchedThreadComments.map(async (commentDetail) => {
      // eslint-disable-next-line no-param-reassign
      commentDetail = new CommentDetail({
        id: commentDetail.id,
        username: commentDetail.username,
        date: commentDetail.date,
        content: commentDetail.is_deleted ? '**komentar telah dihapus**' : commentDetail.content,
      });

      const fetchedCommentReplies = await this._replyRepository
        .getRepliesByCommentId(commentDetail.id);

      const commentReplies = await Promise.all(fetchedCommentReplies.map(async (replyDetail) => {
        // eslint-disable-next-line no-param-reassign
        replyDetail = new ReplyDetail({
          id: replyDetail.id,
          content: replyDetail.is_deleted ? '**balasan telah dihapus**' : replyDetail.content,
          date: replyDetail.date,
          username: replyDetail.username,
        });

        return replyDetail;
      }));

      commentReplies.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

      // eslint-disable-next-line no-param-reassign
      commentDetail.replies = commentReplies;

      return commentDetail;
    }));

    threadComments.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

    threadDetail.comments = threadComments;

    return threadDetail;
  }
}

module.exports = GetThreadDetailUseCase;
