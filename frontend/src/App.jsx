import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthProvider";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <AppRoutes />
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;