const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, userId) {
    const addReply = new AddReply(useCasePayload);
    return this._replyRepository.addReply(addReply, threadId, commentId, userId);
  }
}

module.exports = AddReplyUseCase;
