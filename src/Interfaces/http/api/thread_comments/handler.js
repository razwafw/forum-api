const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
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
}

module.exports = ThreadsHandler;
