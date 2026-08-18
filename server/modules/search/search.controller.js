import { searchCandidates, SearchError } from './search.service.js';

function parseBoolean(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

async function searchCandidatesHandler(request, reply) {
  const page = Math.max(1, parseInt(request.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(request.query.pageSize, 10) || 20));

  const filters = {
    budgetMin: request.query.budgetMin ? Number(request.query.budgetMin) : undefined,
    budgetMax: request.query.budgetMax ? Number(request.query.budgetMax) : undefined,
    cleanliness: request.query.cleanliness ? Number(request.query.cleanliness) : undefined,
    sleepSchedule: request.query.sleepSchedule,
    smokingOk: parseBoolean(request.query.smokingOk),
    petsOk: parseBoolean(request.query.petsOk),
    location: parseBoolean(request.query.location),
    maxDistance: request.query.maxDistance ? Number(request.query.maxDistance) : undefined,
  };

  try {
    const result = await searchCandidates(request.user, filters, { page, pageSize });
    return reply.status(200).send({ success: true, data: result });
  } catch (err) {
    if (err instanceof SearchError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'SEARCH_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

export { searchCandidatesHandler };