/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import HeaderMenu from "../components/shared/HeaderMenu";
import imgLogin from "../assets/images/img-login.svg";

const RedefinirSenha = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMensagem({
        texto: "Token de segurança ausente ou inválido na URL.",
        tipo: "erro",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem({
        texto: "As senhas digitadas não coincidem.",
        tipo: "erro",
      });
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem({
        texto: "A senha deve ter pelo menos 6 caracteres.",
        tipo: "erro",
      });
      return;
    }

    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      await api.post("/redefinir-senha", { token, novaSenha });
      setMensagem({
        texto: "Senha redefinida com sucesso! Redirecionando para o login...",
        tipo: "sucesso",
      });

      setTimeout(() => navigate("/login"), 3000);
    } catch (error: any) {
      setMensagem({
        texto:
          error.response?.data?.message ||
          "Erro ao redefinir a senha. O token pode ter expirado.",
        tipo: "erro",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <HeaderMenu variant="guest" />
      </div>

      <section className="flex w-full lg:w-[60%] h-full items-center justify-center bg-[#2B468B] p-8 relative">
        <div className="w-full max-w-[450px] rounded-[20px] bg-white p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Criar Nova Senha
            </h2>
            <p className="text-sm text-gray-500">
              Digite sua nova senha de acesso abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="novaSenha"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type="password"
                  id="novaSenha"
                  placeholder="Sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base font-normal text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmarSenha"
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base font-normal text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            {mensagem.texto && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-medium ${mensagem.tipo === "sucesso" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
              >
                {mensagem.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || mensagem.tipo === "sucesso"}
              className="mx-auto block h-[61px] w-full rounded-full bg-[#FF6B3D] text-lg font-semibold text-white transition-all hover:bg-[#e05d35] shadow-lg hover:shadow-orange-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "SALVANDO..." : "SALVAR NOVA SENHA"}
            </button>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancelar e Voltar ao Login
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="flex w-full lg:w-[40%] h-full items-center justify-center bg-[#FFF3E3] p-8 lg:p-16">
        <div className="text-center flex flex-col items-center">
          <p className="mb-8 font-nunito text-2xl font-semibold leading-normal text-gray-900 max-w-sm">
            Após redefinir sua senha, você será redirecionado automaticamente
            para o sistema.
          </p>
          <img
            src={imgLogin}
            alt="Ilustração de segurança"
            className="max-w-[250px] h-auto"
          />
        </div>
      </section>
    </div>
  );
};

export default RedefinirSenha;
