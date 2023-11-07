class RemoveCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._commentRepository.removeComment(threadId, commentId, userId);
  }
}

module.exports = RemoveCommentUseCase;
