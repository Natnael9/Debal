import React from "react";

function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-9 w-9 border-2",
    lg: "h-12 w-12 border-[2.5px]",
    xl: "h-16 w-16 border-3",
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-[#2274A5] border-r-transparent border-b-transparent border-l-transparent ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
