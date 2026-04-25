import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import HeaderMenu from "../components/shared/HeaderMenu";
import imgLogin from "../assets/images/img-login.svg";

interface LoginFormInputs {
  email: string;
  senha_pura: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      if (!executeRecaptcha) {
        alert("Erro de segurança: reCAPTCHA não carregado.");
        setIsSubmitting(false);
        return;
      }
      const recaptchaToken = await executeRecaptcha("login_bolsista_admin");

      await signIn(data.email, data.senha_pura, recaptchaToken);

      const userStr = localStorage.getItem("@Papse:user");

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/bolsista");
        }
      }
    } catch {
      alert("Falha no login. Verifique seu email e senha ou tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row relative">
      <div className="absolute top-4 right-4 z-50">
        <HeaderMenu variant="logged-in" />
      </div>

      <section className="flex w-full lg:w-[60%] items-center justify-center bg-[#2B468B] p-8 relative">
        <div className="w-full max-w-[450px] rounded-[20px] bg-white p-8 md:p-12 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
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
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base font-normal text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                  {...register("email", { required: true })}
                />
              </div>
            </div>

            <div className="mb-8">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Senha
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
                  id="senha"
                  placeholder="Digite sua senha"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-base font-normal text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
                  {...register("senha_pura", { required: true })}
                />
              </div>
              <div className="mt-3 text-right">
                <Link
                  to="/esqueci-senha"
                  className="text-sm font-semibold text-[#FF6B3D] hover:text-[#e05d35] transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="mx-auto mt-6 block h-[61px] w-[195px] rounded-full bg-orange-500 text-lg font-semibold text-white transition-colors hover:bg-orange-600 shadow-lg hover:shadow-orange-500/40"
            >
              {isSubmitting ? "AGUARDE..." : "ENTRAR"}
            </button>
          </form>
        </div>
      </section>

      <section className="flex w-full lg:w-[40%] items-center justify-center bg-[#FFF3E3] p-8 lg:p-16">
        <div className="text-center flex flex-col items-center">
          <p className="mb-8 font-nunito text-2xl font-semibold leading-normal text-gray-900 max-w-sm">
            Usuários não vinculados como bolsistas ou administradores do projeto{" "}
            <strong>não</strong> devem utilizar este login!
          </p>
          <img
            src={imgLogin}
            alt="Ilustração de login"
            className="max-w-[250px] h-auto"
          />
        </div>
      </section>
    </div>
  );
};

export default Login;
