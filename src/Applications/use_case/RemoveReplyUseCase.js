class RemoveReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(threadId, commentId, replyId, userId) {
    await this._replyRepository.removeReply(threadId, commentId, replyId, userId);
  }
}

module.exports = RemoveReplyUseCase;
