const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const RemoveReplyUseCase = require('../RemoveReplyUseCase');

describe('RemoveReplyUseCase', () => {
  it('should orchestrate the remove reply action correctly', async () => {
    // Arrange
    const fakeUserId = 'user-123';
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const fakeReplyId = 'reply-123';

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.removeReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const removeReplyUseCase = new RemoveReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await removeReplyUseCase.execute(fakeThreadId, fakeCommentId, fakeReplyId, fakeUserId);

    // Assert
    expect(mockReplyRepository.removeReply).toBeCalledWith(
      'thread-123',
      'comment-123',
      'reply-123',
      'user-123',
    );
  });
});
