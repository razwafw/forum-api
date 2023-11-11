class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const threadComments = await this._commentRepository.getCommentsByThreadId(threadDetail.id);

    // Note: all the processes below will run in parallel
    await Promise.all(threadComments.map(async (commentDetail) => {
      const commentReplies = await this._replyRepository.getRepliesByCommentId(commentDetail.id);
      // eslint-disable-next-line no-param-reassign
      commentDetail.replies = commentReplies;
    }));

    threadDetail.comments = threadComments;

    return threadDetail;
  }
}

module.exports = GetThreadDetailUseCase;
