const CommentRepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comment_replies',
  register: async (server, { container }) => {
    const commentRepliesHandler = new CommentRepliesHandler(container);
    server.route(routes(commentRepliesHandler));
  },
};
