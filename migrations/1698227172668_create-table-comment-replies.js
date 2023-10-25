/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comment_replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
    },
  });

  pgm.addConstraint('comment_replies', 'fk-comment_replies.comment_id-thread_comments.id', 'FOREIGN KEY(comment_id) REFERENCES thread_comments(id) ON DELETE CASCADE');
  pgm.addConstraint('comment_replies', 'fk-comment_replies.owner-users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('comment_replies');
};
