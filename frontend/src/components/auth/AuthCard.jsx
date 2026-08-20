function AuthCard({ title, description, children }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50/70 px-4 py-8 sm:py-12">
      <div className="w-full max-w-[380px] rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100/80 bg-blue-50 text-blue-900 shadow-2xs">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Form Body */}
        <div className="mt-6">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthCard;