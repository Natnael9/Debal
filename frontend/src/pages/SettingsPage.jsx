import React, { useState } from 'react';

const SettingsPage = () => {
  // MOCK DATA: Simulating the initial GET /users/me response
  const [preferences, setPreferences] = useState({
    newChatRequest: true,
    requestAccepted: true,
    newMessage: true,
    meetupUpdate: true,
    reportStatus: false,
    verificationResult: true, // This one is mandatory
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (category) => {
    // Safety check to ensure verificationResult cannot be toggled
    if (category === 'verificationResult') return;

    // Optimistically update the UI state
    const newValue = !preferences[category];
    setPreferences(prev => ({ ...prev, [category]: newValue }));

    // Simulating the PATCH /users/me request
    setIsSaving(true);
    console.log(`Mocking PATCH request... { "notificationPreferences.${category}": ${newValue} }`);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  // Reusable component for each setting row
  const SettingRow = ({ title, description, category, disabled = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="pr-4">
        <h3 className={`text-sm font-bold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm mt-1 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      
      {/* Tailwind Toggle Switch */}
      <button
        type="button"
        onClick={() => handleToggle(category)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          disabled 
            ? 'bg-gray-200 cursor-not-allowed' 
            : (preferences[category] ? 'bg-[#2274A5]' : 'bg-gray-200')
        }`}
      >
        <span 
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            preferences[category] ? 'translate-x-5' : 'translate-x-0'
          }`} 
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0B3954]">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account preferences and notifications.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Email & App Notifications</h2>
            {isSaving && <span className="text-xs font-medium text-[#2274A5] animate-pulse">Saving...</span>}
          </div>
          
          <div className="px-6 py-2">
            {/* Standard Toggles */}
            <SettingRow 
              title="New Chat Requests" 
              description="Get notified when someone wants to connect with you." 
              category="newChatRequest" 
            />
            <SettingRow 
              title="Requests Accepted" 
              description="Get notified when someone accepts your chat request." 
              category="requestAccepted" 
            />
            <SettingRow 
              title="New Messages" 
              description="Get notified when you receive a message and you are offline." 
              category="newMessage" 
            />
            <SettingRow 
              title="Meetup Updates" 
              description="Get notified when a meetup is proposed, accepted, or rescheduled." 
              category="meetupUpdate" 
            />
            <SettingRow 
              title="Report Status" 
              description="Get notified when an admin resolves a report you submitted." 
              category="reportStatus" 
            />
            
            {/* Mandatory Toggle */}
            <SettingRow 
              title="Verification Updates" 
              description="Account verification emails are required and cannot be turned off." 
              category="verificationResult"
              disabled={true} 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;