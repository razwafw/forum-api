const AddedReply = require('../AddedReply');

describe('an AddedReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a comment reply',
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: true,
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a comment reply',
      owner: 'user-123',
    };

    // Action
    const { id, content, owner } = new AddedReply(payload);

    // Assert
    expect(id).toEqual('reply-123');
    expect(content).toEqual('a comment reply');
    expect(owner).toEqual('user-123');
  });
});
