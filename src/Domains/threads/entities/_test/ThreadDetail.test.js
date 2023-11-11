const ThreadDetail = require('../ThreadDetail');

describe('an ThreadDetail entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      username: 'fake_user',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'a thread title',
      body: 'a thread body',
      date: 'Jan 1st, 1970',
      username: 'fake_user',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create threadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread title',
      body: 'a thread body',
      date: 'Jan 1st, 1970',
      username: 'fake_user',
    };

    // Action
    const {
      id,
      title,
      body,
      date,
      username,
      comments,
    } = new ThreadDetail(payload);

    // Assert
    expect(id).toEqual('thread-123');
    expect(title).toEqual('a thread title');
    expect(body).toEqual('a thread body');
    expect(date).toEqual('Jan 1st, 1970');
    expect(username).toEqual('fake_user');
    expect(comments).toEqual([]);
  });
});
