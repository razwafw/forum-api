const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const addComment = new AddComment(useCasePayload);
    return this._commentRepository.addComment(addComment, threadId, userId);
  }
}

module.exports = AddCommentUseCase;
