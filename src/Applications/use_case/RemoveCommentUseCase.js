class RemoveCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._commentRepository.removeCommentById(threadId, commentId, userId);
  }
}

module.exports = RemoveCommentUseCase;
