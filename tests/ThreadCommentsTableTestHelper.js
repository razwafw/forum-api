/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentsTableTestHelper = {
  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = ThreadCommentsTableTestHelper;
