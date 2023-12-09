const CommentDetail = require('../CommentDetail');

describe('an CommentDetail entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'userone',
      date: 'Jan 1st, 1970',
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user',
      date: 123,
      content: true,
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'user',
      date: 'Jan 1st, 1970',
      content: 'a thread comment',
    };

    // Action
    const {
      id,
      username,
      date,
      replies,
      content,
      likeCount,
    } = new CommentDetail(payload);

    // Assert
    expect(id).toEqual('comment-123');
    expect(username).toEqual('user');
    expect(date).toEqual('Jan 1st, 1970');
    expect(replies).toEqual([]);
    expect(content).toEqual('a thread comment');
    expect(likeCount).toEqual(-1);
  });
});
