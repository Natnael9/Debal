import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/common/Navbar";
 import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  
  );
}

export default App;