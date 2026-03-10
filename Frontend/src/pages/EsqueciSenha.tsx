import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import HeaderMenu from "../components/shared/HeaderMenu";
import imgLogin from "../assets/images/img-login.svg";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      const response = await api.post("/esqueci-senha", { email });
      setMensagem({
        texto:
          response.data.message ||
          "Se o e-mail estiver cadastrado, um link de recuperação será enviado.",
        tipo: "sucesso",
      });
      setEmail("");
    } catch {
      setMensagem({
        texto: "Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.",
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
              Recuperar Senha
            </h2>
            <p className="text-sm text-gray-500">
              Digite seu e-mail cadastrado para receber um link de redefinição.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                E-mail
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
              className="mx-auto block h-[61px] w-full rounded-full bg-[#FF6B3D] text-lg font-semibold text-white transition-all hover:bg-[#e05d35] shadow-lg hover:shadow-orange-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "ENVIANDO..." : "ENVIAR LINK"}
            </button>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="flex w-full lg:w-[40%] h-full items-center justify-center bg-[#FFF3E3] p-8 lg:p-16">
        <div className="text-center flex flex-col items-center">
          <p className="mb-8 font-nunito text-2xl font-semibold leading-normal text-gray-900 max-w-sm">
            Mantenha seu acesso seguro. <strong>Nunca</strong> compartilhe sua
            senha com outras pessoas.
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

export default EsqueciSenha;
