const { registerSchema } = require('./auth.validator');
const { registerUser, AuthError } = require('./auth.service');

async function register(request, reply) {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(422).send({ error: parsed.error.flatten() });
  }

  try {
    const result = await registerUser(parsed.data);
    return reply.code(201).send(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'Something went wrong.' });
  }
}

module.exports = { register };