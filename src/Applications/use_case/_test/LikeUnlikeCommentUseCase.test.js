const { DatabaseError } = require('pg');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');

describe('LikeUnlikeCommentUseCase', () => {
  it('should orchestrate the like comment action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const fakeUserId = 'user-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.addCommentLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve('berhasil menyukai komentar'));

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const message = await likeUnlikeCommentUseCase.execute(
      fakeThreadId,
      fakeCommentId,
      fakeUserId,
    );

    // Assert
    expect(message).toEqual('berhasil menyukai komentar');
    expect(mockCommentRepository.addCommentLikeByCommentId).toBeCalledWith(
      'thread-123',
      'comment-123',
      'user-123',
    );
  });

  it('should orchestrate the unlike comment action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const fakeUserId = 'user-123';

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.addCommentLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.reject(new DatabaseError('user sudah menyukai komentar')));
    mockCommentRepository.removeCommentLikeByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve('berhasil membatalkan aksi menyukai komentar'));

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    const message = await likeUnlikeCommentUseCase.execute(
      fakeThreadId,
      fakeCommentId,
      fakeUserId,
    );

    // Assert
    expect(message).toEqual('berhasil membatalkan aksi menyukai komentar');
    expect(mockCommentRepository.addCommentLikeByCommentId).toBeCalledWith(
      'thread-123',
      'comment-123',
      'user-123',
    );
    expect(mockCommentRepository.addCommentLikeByCommentId)
      .rejects.toThrowError(DatabaseError);
    expect(mockCommentRepository.removeCommentLikeByCommentId).toBeCalledWith(
      'thread-123',
      'comment-123',
      'user-123',
    );
  });
});
