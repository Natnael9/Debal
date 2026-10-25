import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiDelete, clearToken } from "../services/api";
import { disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await apiDelete('/users/me');
      disconnectSocket();
      clearToken();
      setUser(null);
      if (onClose) onClose();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-gray-100 space-y-5">
        
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Account Permanently</h3>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-gray-600">
          All your profile data, roommate preferences, chat history, and verification records will be permanently removed from Debal. Type <strong className="text-rose-600">DELETE</strong> below to confirm.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Type DELETE"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-900 outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/10"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmationText('');
              setError('');
              onClose();
            }}
            disabled={isDeleting}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmationText !== 'DELETE'}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Permanently Delete"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteAccountModal;