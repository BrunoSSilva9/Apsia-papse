import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import { PrivateRoute } from "./routes/PrivateRoute";
import AdministrativePanel from "./components/pages/AdministrativePanel";
import ManageAppointments from "./components/pages/ManageAppointments";

function App() {
  return (
    <AuthProvider>
      <Routes>

        
        {/* Rotas privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdministrativePanel />}>
            <Route index element={<ManageAppointments />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
