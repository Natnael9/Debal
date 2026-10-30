import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NotificationToast from "./NotificationToast"; // Import the toast

function AppLayout({ children }) {
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.includes(location.pathname);
  const isMessagesPage = location.pathname.includes("/messages");

  const hideFooter = isAuthPage || isMessagesPage;

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full min-w-0">
        {children}
      </main>

      {!hideFooter && <Footer />}

      {/* Global Real-Time Socket Toast */}
      <NotificationToast />
    </div>
  );
}

export default AppLayout;