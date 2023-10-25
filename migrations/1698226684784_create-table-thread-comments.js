/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('thread_comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    thread_id: {
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

  pgm.addConstraint('thread_comments', 'fk-thread_comments.thread_id-threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('thread_comments', 'fk-thread_comments.owner-users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comments');
};
