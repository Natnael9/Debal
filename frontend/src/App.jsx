import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;