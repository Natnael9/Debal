export const PHOTO_MODERATION_STATUS = {
  NONE: "none",         
  PENDING: "pending",   
  APPROVED: "approved", 
  FLAGGED: "flagged",   
  REJECTED: "rejected", 
};
export const PHOTO_MODERATION_MESSAGES = {
  [PHOTO_MODERATION_STATUS.PENDING]: "Your photo is being reviewed and will appear once approved.",
  [PHOTO_MODERATION_STATUS.FLAGGED]: "This photo was flagged for review and isn't visible yet.",
  [PHOTO_MODERATION_STATUS.REJECTED]: "This photo didn't pass review. Please upload a different one.",
};
export function isPhotoHidden(status) {
  return (
    status === PHOTO_MODERATION_STATUS.PENDING ||
    status === PHOTO_MODERATION_STATUS.FLAGGED ||
    status === PHOTO_MODERATION_STATUS.REJECTED
  );
}