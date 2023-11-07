const CommentRepository = require('../../../Domains/comments/CommentRepository');
const RemoveCommentUseCase = require('../RemoveCommentUseCase');

describe('RemoveCommentUseCase', () => {
  it('should orchestrate the remove comment action correctly', async () => {
    // Arrange
    const fakeUserId = 'user-123';
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.removeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const removeCommentUseCase = new RemoveCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await removeCommentUseCase.execute(fakeThreadId, fakeCommentId, fakeUserId);

    // Assert
    expect(mockCommentRepository.removeComment).toBeCalledWith(
      'thread-123',
      'comment-123',
      'user-123',
    );
  });
});
