const ReplyDetail = require('../ReplyDetail');

describe('an ReplyDetail entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a comment reply',
      date: 'Jan 1st, 1970',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: true,
      date: 123,
      username: 'user',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create replyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a comment reply',
      date: 'Jan 1st, 1970',
      username: 'user',
    };

    // Action
    const {
      id,
      content,
      date,
      username,
    } = new ReplyDetail(payload);

    // Assert
    expect(id).toEqual('reply-123');
    expect(content).toEqual('a comment reply');
    expect(date).toEqual('Jan 1st, 1970');
    expect(username).toEqual('user');
  });
});
