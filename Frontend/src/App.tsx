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
import Sobre from "./pages/Sobre";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

import { PrivateRoute } from "./pages/PrivateRoute";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6Ldv7MgsAAAAAOApElB-PY4fR5ihMxdjlq5aCHLb">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/login" element={<Login />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          <Route element={<PrivateRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<AdministrativePanel />}>
              <Route index element={<ManageAppointments />} />
              <Route
                path="gerenciamento-colaboradores"
                element={<Collaborators />}
              />
              <Route path="relatorios" element={<Relatorio />} />
              <Route path="historico" element={<Historical />} />

              <Route
                path="lista-espera"
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
                path="lista-espera-atendimento-regular"
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
                path="lista-atendimento-protocolo"
                element={
                  <PatientList
                    status="atendimento_protocolo"
                    title="Atendimentos de Protocolo"
                    transitions={[
                      {
                        label: "Encaminhar para outro bolsista",
                        target: "atendimento_protocolo",
                      },
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
                path="lista-atendimento-regular"
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
            </Route>
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/bolsista" element={<Bolsista />} />
          </Route>

          <Route path="*" element={<div>Página não encontrada</div>} />
        </Routes>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
