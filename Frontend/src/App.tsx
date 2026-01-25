import { Routes /*Route*/ } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes></Routes>
    </AuthProvider>
  );
}

export default App;
