import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/common/Navbar";
 import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>  
    </BrowserRouter>
  
  );
}

export default App;