import {
  getMatchFeed,
  sendMatchRequest,
  respondToMatchRequest,
  MatchmakingError,
} from './matchmaking.service.js';

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

async function sendMatchRequestHandler(request, reply) {
  const { userId } = request.params;
  const { message } = request.body || {};

  try {
    const result = await sendMatchRequest(request.user, userId, message);
    return reply.status(201).send({ success: true, data: result });
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

async function respondToMatchRequestHandler(request, reply) {
  const { requestId } = request.params;
  const { accept } = request.body || {};

  try {
    const result = await respondToMatchRequest(request.user, requestId, !!accept);
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

export { getMatchFeedHandler, sendMatchRequestHandler, respondToMatchRequestHandler };