const autoBind = require('auto-bind');

const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const RemoveCommentUseCase = require('../../../../Applications/use_case/RemoveCommentUseCase');
const LikeUnlikeCommentUseCase = require('../../../../Applications/use_case/LikeUnlikeCommentUseCase');

class ThreadCommentsHandler {
  constructor(container) {
    this._container = container;

    autoBind(this);
  }

  async postThreadCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await addCommentUseCase.execute(request.payload, threadId, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentHandler(request, h) {
    const removeCommentUseCase = this._container.getInstance(RemoveCommentUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await removeCommentUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
      message: 'komentar berhasil dihapus',
    });
    return response;
  }

  async putThreadCommentLikeHandler(request, h) {
    const likeUnlikeCommentUseCase = this._container.getInstance(LikeUnlikeCommentUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const message = await likeUnlikeCommentUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
      message,
    });
    return response;
  }
}

module.exports = ThreadCommentsHandler;
