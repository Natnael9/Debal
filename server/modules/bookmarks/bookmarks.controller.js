import { addBookmark, listBookmarks, removeBookmark, BookmarksError } from './bookmarks.service.js';

async function addBookmarkHandler(request, reply) {
  const { bookmarkedUserId } = request.body || {};

  if (!bookmarkedUserId) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELD',
      message: 'bookmarkedUserId is required',
    });
  }

  try {
    const bookmark = await addBookmark(request.user._id, bookmarkedUserId);
    return reply.status(201).send({ success: true, data: { bookmark } });
  } catch (err) {
    if (err instanceof BookmarksError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'BOOKMARKS_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

async function listBookmarksHandler(request, reply) {
  try {
    const bookmarks = await listBookmarks(request.user._id);
    return reply.status(200).send({ success: true, data: { bookmarks } });
  } catch (err) {
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

async function removeBookmarkHandler(request, reply) {
  const { bookmarkedUserId } = request.params;

  try {
    await removeBookmark(request.user._id, bookmarkedUserId);
    return reply.status(200).send({ success: true, message: 'Bookmark removed.' });
  } catch (err) {
    if (err instanceof BookmarksError) {
      return reply
        .status(err.statusCode)
        .send({ success: false, error: 'BOOKMARKS_ERROR', message: err.message });
    }
    request.log.error(err);
    return reply
      .status(500)
      .send({ success: false, error: 'SERVER_ERROR', message: 'Something went wrong.' });
  }
}

export { addBookmarkHandler, listBookmarksHandler, removeBookmarkHandler };