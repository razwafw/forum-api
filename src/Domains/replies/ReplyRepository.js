/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
class ReplyRepository {
  async addReply(addReply, threadId, commentId, userId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getRepliesByCommentId(commentId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async removeReplyById(threadId, commentId, replyId, userId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyRepository;
