import React, { useState } from 'react';

const PhotoReviewQueuePage = () => {
  // MOCK DATA: Simulating GET /admin/photo-review?status=flagged
  const [flaggedPhotos, setFlaggedPhotos] = useState([
    {
      userId: 'user_789',
      name: 'Abebe Kebede',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      flagReason: 'Potential explicit content (89%)',
      submittedAt: 'Today, 11:23 AM'
    },
    {
      userId: 'user_890',
      name: 'Sara Ahmed',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      flagReason: 'Graphic content detected (75%)',
      submittedAt: 'Yesterday, 4:15 PM'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = (userId, actionType) => {
    setIsSubmitting(true);
    console.log(`Mocking PATCH /admin/photo-review/${userId}... action: ${actionType}`);

    // Simulate API delay
    setTimeout(() => {
      setFlaggedPhotos(prev => prev.filter(photo => photo.userId !== userId));
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Photo Review Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Review user avatars flagged by the automated content moderation pipeline.</p>
      </div>

      {flaggedPhotos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Queue is empty</h3>
          <p className="mt-1 text-sm text-gray-500">All flagged photos have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flaggedPhotos.map((photo) => (
            <div 
              key={photo.userId} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col"
            >
              
              {/* FLAG ICON - Positioned absolute in the top right corner, mimicking your bookmark button */}
              <div 
                className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm z-10"
                title="Flagged by moderation"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="p-5 flex flex-col h-full">
                
                {/* MatchCard Style Header with 16x16 rounded-full avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                    <img 
                      src={photo.avatarUrl} 
                      alt={`Flagged avatar for ${photo.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{photo.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">Submitted: {photo.submittedAt}</p>
                  </div>
                </div>
                
                {/* MatchCard Style Bio Section */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  This avatar requires administrative review before it can be published to the match feed.
                </p>
                
                {/* MatchCard Style Tag Section */}
                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    Reason: {photo.flagReason}
                  </span>
                </div>

                {/* MatchCard Style Buttons - Split in two to match your button style */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(photo.userId, 'rejected')}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(photo.userId, 'approved')}
                    disabled={isSubmitting}
                    className="w-full py-2 bg-[#0B3954] text-white rounded-lg text-sm font-bold hover:bg-[#082a3e] transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoReviewQueuePage;