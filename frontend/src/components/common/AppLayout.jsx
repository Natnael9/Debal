import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function AppLayout({ children }) {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default AppLayout;