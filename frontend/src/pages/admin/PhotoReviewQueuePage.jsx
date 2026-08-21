import React, { useState, useEffect } from 'react';
import { getFlaggedPhotos, decidePhotoReview } from '../../services/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PhotoReviewQueuePage = () => {
  const [flaggedPhotos, setFlaggedPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getFlaggedPhotos()
      .then((data) => {
        const list = data?.data?.users ?? data?.users ?? (Array.isArray(data?.data) ? data?.data : []);
        const formatted = list.map((u) => ({
          userId: u._id || u.id,
          name: u.name || 'User',
          avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'user')}`,
          flagReason: u.flagReason || 'Automated safety filter flag (high risk score)',
          submittedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
        }));
        setFlaggedPhotos(formatted);
      })
      .catch((err) => console.error("Failed to load flagged photos:", err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAction = async (userId, actionType) => {
    setIsSubmitting(true);
    try {
      const decision = actionType === 'approved' ? 'approve' : 'reject';
      await decidePhotoReview(userId, decision);
    } catch (err) {
      console.warn("Photo review action failed:", err.message);
    } finally {
      setFlaggedPhotos((prev) => prev.filter((photo) => photo.userId !== userId));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Content Moderation
            </h1>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Photo Review Queue
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Review user avatars flagged by the automated safety pipeline.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-3xl border border-slate-200/80 bg-white shadow-xs">
            <LoadingSpinner size="md" />
            <p className="text-xs font-semibold text-slate-400">Loading flagged photo queue...</p>
          </div>
        ) : flaggedPhotos.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">Queue is Clear</h3>
            <p className="mt-1 text-xs text-slate-400">All flagged photos have been evaluated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {flaggedPhotos.map((photo) => (
              <div 
                key={photo.userId} 
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md"
              >
                <div>
                  {/* Photo & Flag Badge */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                    <img 
                      src={photo.avatarUrl} 
                      alt={`Flagged avatar for ${photo.name}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2.5 top-2.5 rounded-full border border-rose-200 bg-rose-50/95 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 shadow-2xs backdrop-blur-xs">
                      Flagged
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-900">{photo.name}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">Submitted: {photo.submittedAt}</p>
                    
                    <div className="mt-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-[11px] font-medium text-rose-800">
                      {photo.flagReason}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => handleAction(photo.userId, 'rejected')}
                    disabled={isSubmitting}
                    className="w-1/2 rounded-xl border border-rose-200 bg-rose-50/70 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-98 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(photo.userId, 'approved')}
                    disabled={isSubmitting}
                    className="w-1/2 rounded-xl bg-[#071E2D] py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PhotoReviewQueuePage;