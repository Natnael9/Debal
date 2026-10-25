import { questionnaireSchema, profileUpdateSchema } from './questionnaire.validator.js';
import {
  submitQuestionnaire,
  updateProfile,
  getUserProfileById,
  freezeAccount,
  unfreezeAccount,
  deleteAccount,
  UsersError,
} from './users.service.js';

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
        user,
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

async function updateProfileHandler(request, reply) {
  const parsed = profileUpdateSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(422).send({
      success: false,
      error: 'VALIDATION_ERROR',
      message: parsed.error.flatten(),
    });
  }

  if (Object.keys(parsed.data).length === 0) {
    return reply.status(400).send({
      success: false,
      error: 'EMPTY_UPDATE',
      message: 'Provide at least one field to update.',
    });
  }

  try {
    const user = await updateProfile(request.user._id, parsed.data);
    return reply.status(200).send({ success: true, data: { user } });
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

async function getUserProfileByIdHandler(request, reply) {
  const { id } = request.params;
  try {
    const user = await getUserProfileById(id);
    return reply.status(200).send({ success: true, data: { user } });
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

async function freezeAccountHandler(request, reply) {
  try {
    const user = await freezeAccount(request.user._id);
    return reply.status(200).send({
      success: true,
      data: { user },
      message: 'Account paused successfully. Your profile is now hidden from the feed.',
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

async function unfreezeAccountHandler(request, reply) {
  try {
    const user = await unfreezeAccount(request.user._id);
    return reply.status(200).send({
      success: true,
      data: { user },
      message: 'Account reactivated successfully. Your profile is visible in the feed again.',
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

async function deleteAccountHandler(request, reply) {
  try {
    await deleteAccount(request.user._id);
    return reply.status(200).send({
      success: true,
      message: 'Account permanently deleted.',
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
      .send({ success: false, error: 'SERVER_ERROR', message: 'Failed to delete account.' });
  }
}

export {
  submitQuestionnaireHandler,
  updateProfileHandler,
  getUserProfileByIdHandler,
  freezeAccountHandler,
  unfreezeAccountHandler,
  deleteAccountHandler,
};