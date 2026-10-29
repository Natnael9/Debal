// Photo moderation queue disabled for now (Redis commented out)

export const photoModerationQueue = {
  add: async () => {},
  on: () => {},
};

export async function enqueuePhotoModerationJob({ userId, imageUrl }) {
  // Moderation queue disabled for now
}
