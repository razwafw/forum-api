const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';

    const mockReplyDetailA = new ReplyDetail({
      id: 'reply-123',
      content: 'a comment reply',
      date: 'Jan 1st, 1970',
      username: 'user_a',
    });
    const mockReplyDetailB = new ReplyDetail({
      id: 'reply-456',
      content: 'a comment reply',
      date: 'Jan 1st, 1970',
      username: 'user_b',
    });
    const mockReplyDetailC = new ReplyDetail({
      id: 'reply-789',
      content: 'a comment reply',
      date: 'Jan 1st, 1970',
      username: 'user_c',
    });
    const mockReplyDetails = [
      mockReplyDetailA,
      mockReplyDetailB,
      mockReplyDetailC,
    ];

    const mockCommentDetailA = new CommentDetail({
      id: 'comment-123',
      username: 'user_a',
      date: 'Jan 1st, 1970',
      content: 'a thread comment',
    });
    const mockCommentDetailB = new CommentDetail({
      id: 'comment-456',
      username: 'user_b',
      date: 'Jan 1st, 1970',
      content: 'a thread comment',
    });
    const mockCommentDetails = [mockCommentDetailA, mockCommentDetailB];

    const mockThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: 'Jan 1st, 1970',
      username: 'user_a',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentDetails));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-123') {
          return Promise.resolve(mockReplyDetails.slice(0, 2));
        }
        return Promise.resolve([mockReplyDetails[2]]);
      });

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(fakeThreadId);

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: 'Jan 1st, 1970',
      username: 'user_a',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'user_a',
          date: 'Jan 1st, 1970',
          replies: [
            new ReplyDetail({
              id: 'reply-123',
              content: 'a comment reply',
              date: 'Jan 1st, 1970',
              username: 'user_a',
            }),
            new ReplyDetail({
              id: 'reply-456',
              content: 'a comment reply',
              date: 'Jan 1st, 1970',
              username: 'user_b',
            }),
          ],
          content: 'a thread comment',
        }),
        new CommentDetail({
          id: 'comment-456',
          username: 'user_b',
          date: 'Jan 1st, 1970',
          replies: [
            new ReplyDetail({
              id: 'reply-789',
              content: 'a comment reply',
              date: 'Jan 1st, 1970',
              username: 'user_c',
            }),
          ],
          content: 'a thread comment',
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(2);
  });
});
