import jwt from 'jsonwebtoken';

async function requireAdmin(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or malformed Authorization header',
    });
  }

  const token = authHeader.slice('Bearer '.length);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Token is invalid or expired',
    });
  }

  // A regular user token can never satisfy this, regardless of payload shape.
  if (payload.type !== 'admin') {
    return reply.status(403).send({
      success: false,
      error: 'ADMIN_REQUIRED',
      message: 'Admin credentials required',
    });
  }

  request.admin = payload;
}

export { requireAdmin };