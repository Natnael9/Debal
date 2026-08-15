function AuthCard({ title, description, children }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        </div>

        {/* Page-specific content */}
        {children}

      </div>
    </div>
  );
}

export default AuthCard;