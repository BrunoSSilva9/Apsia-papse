import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/login";
import AdministrativePanel from "./pages/AdministrativePanel";
import ManageAppointments from "./pages/ManageAppointments";
import PatientList from "./pages/PatientList";
import Bolsista from "./pages/Bolsista";
import Historical from "./pages/Historico";
import Collaborators from "./pages/Collaborators";
import Relatorio from "./pages/relatorio";
import Home from "./pages/Home";
import Formulario from "./pages/Formulario";
import Formulario From "./pages/Sobre";

import { PrivateRoute } from "./pages/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />
        <Route path="/formulario" element={<Formulario />} />

        <Route element={<PrivateRoute requiredRole="ADMIN" />}>
          <Route path="/admin" element={<AdministrativePanel />}>
            <Route index element={<ManageAppointments />} />
            <Route path="colaboradores" element={<Collaborators />} />
            <Route path="relatorios" element={<Relatorio />} />
            <Route path="historical" element={<Historical />} />

            <Route
              path="waiting-list"
              element={
                <PatientList
                  status="lista_de_espera"
                  title="Lista de Espera"
                  transitions={[
                    {
                      label: "Encaminhar para Atendimento de Protocolo",
                      target: "atendimento_protocolo",
                    },
                  ]}
                  canEncerrar={true}
                />
              }
            />

            <Route
              path="regular-waiting"
              element={
                <PatientList
                  status="espera_regulares"
                  title="Lista de Espera para Atendimentos Regulares"
                  transitions={[
                    {
                      label: "Encaminhar para Atendimento Regular",
                      target: "atendimento_regular",
                    },
                  ]}
                  canEncerrar={true}
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
                      label: "Encaminhar para outro bolsista",
                      target: "atendimento_protocolo",
                    }, // Auto-encaminhamento
                    {
                      label: "Encaminhar para lista de espera regular",
                      target: "espera_regulares",
                    },
                  ]}
                  canEncerrar={true}
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
                      label: "Encaminhar para outro bolsista",
                      target: "atendimento_regular",
                    },
                  ]}
                  canEncerrar={true}
                />
              }
            />

            <Route path="relatorio" element={<Relatorio />} />

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
