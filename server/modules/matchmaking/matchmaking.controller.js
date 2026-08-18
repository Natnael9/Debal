import { getMatchFeed, MatchmakingError } from './matchmaking.service.js';

async function getMatchFeedHandler(request, reply) {
  const page = Math.max(1, parseInt(request.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(request.query.pageSize, 10) || 20));

  try {
    const result = await getMatchFeed(request.user, { page, pageSize });
    return reply.status(200).send({ success: true, data: result });
  } catch (err) {
    if (err instanceof MatchmakingError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'MATCHMAKING_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

export { getMatchFeedHandler };