import { questionnaireSchema } from './questionnaire.validator.js';
import { submitQuestionnaire, UsersError } from './users.service.js';

async function submitQuestionnaireHandler(request, reply) {
  const parsed = questionnaireSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(422).send({
      success: false,
      error: 'VALIDATION_ERROR',
      message: parsed.error.flatten(),
    });
  }

  try {
    const user = await submitQuestionnaire(request.user._id, parsed.data);
    return reply.status(200).send({
      success: true,
      data: {
        questionnaireCompleted: user.questionnaireCompleted,
        profileCompletionPercent: user.profileCompletionPercent,
      },
    });
  } catch (err) {
    if (err instanceof UsersError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'USERS_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

export { submitQuestionnaireHandler };