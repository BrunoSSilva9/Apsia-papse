import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/login";
import AdministrativePanel from "./pages/AdministrativePanel";
import ManageAppointments from "./pages/ManageAppointments";
import PatientList from "./pages/PatientList";
import Bolsista from "./pages/Bolsista";
import Historical from "./pages/Historico";
import Home from "./pages/Home";
import Sobre from './pages/Sobre';

import { PrivateRoute } from "./pages/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdministrativePanel />}>
            <Route index element={<ManageAppointments />} />

            <Route
              path="waiting-list"
              element={
                <PatientList
                  status="lista_de_espera"
                  title="Lista de Espera"
                  transitions={[
                    {
                      label: "Mover para Espera Regular",
                      target: "espera_regulares",
                    },
                    {
                      label: "Mover para Protocolo",
                      target: "atendimento_protocolo",
                    },
                    {
                      label: "Mover para Regular",
                      target: "atendimento_regular",
                    },
                  ]}
                />
              }
            />

            <Route
              path="regular-waiting"
              element={
                <PatientList
                  status="espera_regulares"
                  title="Espera para Atendimentos Regulares"
                  transitions={[
                    {
                      label: "Retornar para Lista de Espera",
                      target: "lista_de_espera",
                    },
                    {
                      label: "Mover para Protocolo",
                      target: "atendimento_protocolo",
                    },
                    {
                      label: "Mover para Regular",
                      target: "atendimento_regular",
                    },
                  ]}
                />
              }
            />

            <Route
              path="protocol"
              element={
                <PatientList
                  status="atendimento_protocolo"
                  title="Atendimentos de Protocolo"
                  transitions={[
                    {
                      label: "Mover para Regular",
                      target: "atendimento_regular",
                    },
                    {
                      label: "Mover para Espera Regular",
                      target: "espera_regulares",
                    },
                  ]}
                />
              }
            />

            <Route
              path="regular"
              element={
                <PatientList
                  status="atendimento_regular"
                  title="Atendimentos Regulares"
                  transitions={[
                    {
                      label: "Mover para Protocolo",
                      target: "atendimento_protocolo",
                    },
                    {
                      label: "Mover para Espera Regular",
                      target: "espera_regulares",
                    },
                  ]}
                />
              }
            />

            <Route
              path="report"
              element={<div>Relatórios (Em construção)</div>}
            />
            <Route path="historical" element={<Historical />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/bolsista" element={<Bolsista />} />
        </Route>

        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
