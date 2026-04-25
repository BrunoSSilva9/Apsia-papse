import { createContext, useState, useEffect /*,useContext*/ } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import type { AuthResponse, Colaborador } from "../types";

interface AuthContextData {
  signed: boolean;
  user: Colaborador | null;
  signIn: (
    email: string,
    senha_pura: string,
    recaptchaToken?: string,
  ) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storagedUser = localStorage.getItem("@Papse:user");
      const storagedToken = localStorage.getItem("@Papse:token");

      if (storagedUser && storagedToken) {
        api.defaults.headers.common["Authorization"] =
          `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(
    email: string,
    senha_pura: string,
    recaptchaToken?: string,
  ) {
    const response = await api.post<AuthResponse>("/login", {
      email: email,
      senha: senha_pura,
      recaptchaToken,
    });

    const {
      token,
      usuario,
      colaborador: colaboradorResp,
      user,
    } = response.data as AuthResponse;
    const usuarioFinal = usuario || colaboradorResp || user;

    if (!token || !usuarioFinal) {
      throw new Error("Resposta de autenticação inválida.");
    }

    localStorage.setItem("@Papse:user", JSON.stringify(usuarioFinal));
    localStorage.setItem("@Papse:token", token);

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(usuarioFinal);
  }

  function signOut() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
