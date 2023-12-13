/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('comment_likes', 'unique-comment_id-user_id', 'UNIQUE(comment_id, user_id)');
  pgm.addConstraint('comment_likes', 'fk-comment_likes.comment_id-thread_comments.id', 'FOREIGN KEY(comment_id) REFERENCES thread_comments(id) ON DELETE CASCADE');
  pgm.addConstraint('comment_likes', 'fk-comment_replies.user_id-users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};
