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

    // C's reply goes ahead of B's reply ahead of A's reply
    const fakeDateReplyC = new Date(10000).toISOString();
    const fakeDateReplyB = new Date(100000).toISOString();
    const fakeDateReplyA = new Date(1000000).toISOString();
    const mockReplyDetailA = {
      id: 'reply-123',
      content: 'a comment reply',
      date: fakeDateReplyA,
      username: 'user_a',
      is_deleted: false,
    };
    const mockReplyDetailB = {
      id: 'reply-456',
      content: 'a comment reply',
      date: fakeDateReplyB,
      username: 'user_b',
      is_deleted: false,
    };
    const mockReplyDetailC = {
      id: 'reply-789',
      content: 'a comment reply',
      date: fakeDateReplyC,
      username: 'user_c',
      is_deleted: true,
    };
    const mockReplyDetails = [
      mockReplyDetailA,
      mockReplyDetailB,
      mockReplyDetailC,
    ];

    // B's comment goes ahead of A's comment
    const fakeDateCommentB = new Date(100).toISOString();
    const fakeDateCommentA = new Date(1000).toISOString();
    const mockCommentDetailA = {
      id: 'comment-123',
      username: 'user_a',
      date: fakeDateCommentA,
      content: 'a thread comment',
      is_deleted: true,
    };
    const mockCommentDetailB = {
      id: 'comment-456',
      username: 'user_b',
      date: fakeDateCommentB,
      content: 'a thread comment',
      is_deleted: false,
    };
    const mockCommentDetails = [mockCommentDetailA, mockCommentDetailB];

    const fakeDateThread = new Date(10).toISOString();
    const mockThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: fakeDateThread,
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
    mockCommentRepository.getCommentLikesCountByCommentId = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === 'comment-123') {
          return Promise.resolve(2);
        }
        return Promise.resolve(1);
      });
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
      date: fakeDateThread,
      username: 'user_a',
      comments: [
        new CommentDetail({
          id: 'comment-456',
          username: 'user_b',
          date: fakeDateCommentB,
          replies: [
            new ReplyDetail({
              id: 'reply-789',
              content: '**balasan telah dihapus**',
              date: fakeDateReplyC,
              username: 'user_c',
            }),
          ],
          content: 'a thread comment',
          likeCount: 1,
        }),
        new CommentDetail({
          id: 'comment-123',
          username: 'user_a',
          date: fakeDateCommentA,
          replies: [
            new ReplyDetail({
              id: 'reply-456',
              content: 'a comment reply',
              date: fakeDateReplyB,
              username: 'user_b',
            }),
            new ReplyDetail({
              id: 'reply-123',
              content: 'a comment reply',
              date: fakeDateReplyA,
              username: 'user_a',
            }),
          ],
          content: '**komentar telah dihapus**',
          likeCount: 2,
        }),
      ],
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentLikesCountByCommentId).toBeCalledTimes(2);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(2);
  });
});
