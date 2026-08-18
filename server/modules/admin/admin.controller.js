import { loginAdmin, AdminError } from './admin.service.js';

async function login(request, reply) {
  const { email, password } = request.body || {};

  if (!email || !password) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'email and password are required',
    });
  }

  try {
    const result = await loginAdmin({ email, password });
    return reply.status(200).send({ success: true, data: result });
  } catch (err) {
    if (err instanceof AdminError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'ADMIN_AUTH_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

export { login };