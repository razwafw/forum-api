const { DatabaseError } = require('pg');

class LikeUnlikeCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(threadId, commentId, userId) {
    try {
      const message = await this._commentRepository.addCommentLikeByCommentId(
        threadId,
        commentId,
        userId,
      );

      return message;
    } catch (error) {
      if (error instanceof DatabaseError) {
        const message = await this._commentRepository.removeCommentLikeByCommentId(
          threadId,
          commentId,
          userId,
        );

        return message;
      }

      throw error;
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;
