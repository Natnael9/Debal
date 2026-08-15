import { Routes, Route, Link } from "react-router-dom";

const LandingPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Landing Page Placeholder</h1>
    <div className="space-x-4">
      <Link to="/login" className="text-blue-600 underline">Login</Link>
      <Link to="/register" className="text-blue-600 underline">Register</Link>
      <Link to="/questionnaire" className="text-blue-600 underline">Go to Questionnaire</Link>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Login</h1>
    <Link to="/" className="text-blue-600 underline">Back Home</Link>
  </div>
);

const RegisterPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Register</h1>
    <Link to="/" className="text-blue-600 underline">Back Home</Link>
  </div>
);

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default PublicRoutes;