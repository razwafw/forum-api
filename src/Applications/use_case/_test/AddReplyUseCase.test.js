const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'a comment reply',
    };
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const fakeUserId = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: 'a comment reply',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      fakeThreadId,
      fakeCommentId,
      fakeUserId,
    );

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: 'a comment reply',
      owner: 'user-123',
    }));
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: 'a comment reply',
      }),
      'thread-123',
      'comment-123',
      'user-123',
    );
  });
});
