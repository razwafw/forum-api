const autoBind = require('auto-bind');

const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const RemoveReplyUseCase = require('../../../../Applications/use_case/RemoveReplyUseCase');

class CommentRepliesHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postCommentReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addedReply = await addReplyUseCase.execute(
      request.payload,
      threadId,
      commentId,
      userId,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentReplyHandler(request, h) {
    const removeReplyUseCase = this._container.getInstance(RemoveReplyUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    await removeReplyUseCase.execute(threadId, commentId, replyId, userId);

    const response = h.response({
      status: 'success',
      message: 'balasan berhasil dihapus',
    });
    return response;
  }
}

module.exports = CommentRepliesHandler;
