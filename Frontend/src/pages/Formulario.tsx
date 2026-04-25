/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import illustration from "../assets/images/formulario_illustration.png";
import HeaderMenu from "../components/shared/HeaderMenu";
import { CheckCircle } from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const CURSOS_UNIFESSPA = [
  "Administração",
  "Agronomia",
  "Arquitetura e Urbanismo",
  "Artes Visuais",
  "Ciências Biológicas",
  "Ciências Contábeis",
  "Ciências Econômicas",
  "Ciências Naturais",
  "Ciências Sociais",
  "Direito",
  "Engenharia Civil",
  "Engenharia de Computação",
  "Engenharia de Materiais",
  "Engenharia de Minas e Meio Ambiente",
  "Engenharia Elétrica",
  "Engenharia Florestal",
  "Engenharia Mecânica",
  "Engenharia Química",
  "Física",
  "Geografia",
  "Geologia",
  "História",
  "Jornalismo",
  "Letras – Inglês",
  "Letras – Língua Portuguesa",
  "Letras – Português",
  "Matemática",
  "Medicina Veterinária",
  "Pedagogia",
  "Psicologia",
  "Química",
  "Saúde Coletiva",
  "Sistemas de Informação",
  "Zootecnia",
];

interface FormData {
  nome: string;
  email: string;
  matricula: string;
  telefone: string;
  curso: string;
  data_nascimento: string;
  relato: string;
  termo_aceite: boolean;
}

const Formulario = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (!executeRecaptcha) {
        alert("Erro de segurança: reCAPTCHA não carregado.");
        setIsSubmitting(false);
        return;
      }
      const recaptchaToken = await executeRecaptcha("formulario_paciente");

      if (!/^[0-9]+$/.test(data.telefone)) {
        alert("O campo Telefone deve conter apenas números.");
        setIsSubmitting(false);
        return;
      }

      if (!/^[0-9]+$/.test(data.matricula)) {
        alert("O campo Matrícula deve conter apenas números.");
        setIsSubmitting(false);
        return;
      }

      const dataNascimento = new Date(data.data_nascimento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataNascimento > hoje) {
        alert("Por favor, insira uma data de nascimento válida.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        nome: data.nome.trim(),
        email: data.email.trim(),
        matricula: data.matricula.trim(),
        data_nascimento: new Date(data.data_nascimento).toISOString(),
        data_inscricao: new Date().toISOString(),
        telefone: data.telefone.trim(),
        curso: data.curso,
        relato: data.relato ? data.relato.trim() : "SEM RELATO",
        termo_lgpd: true,
        recaptchaToken: recaptchaToken,
      };

      await api.post("/pacientes", payload, {
        headers: { "Content-Type": "application/json" },
      });
      setShowSuccessModal(true);
      reset();
    } catch (error: any) {
      console.error("Erro completo:", error);
      alert(
        "Ocorreu um erro. Verifique se a matrícula já não está cadastrada.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#FF6B3D] flex flex-col relative font-sans overflow-hidden">
      <nav className="flex flex-wrap justify-between items-center p-8 relative z-50 text-white">
        <div className="flex gap-4 md:gap-8 items-center">
          <Link
            to="/"
            className="text-white/80 hover:text-white no-underline font-medium text-sm tracking-wide transition-colors"
          >
            PRINCIPAL
          </Link>
          <Link
            to="/sobre"
            className="text-white/80 hover:text-white no-underline font-medium text-sm tracking-wide transition-colors"
          >
            SOBRE
          </Link>
          <Link
            to="/formulario"
            className="text-white font-bold text-sm tracking-wide transition-colors"
          >
            FORMULÁRIO
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <HeaderMenu variant="guest" />
        </div>
      </nav>

      <div className="flex flex-1 relative">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 z-10">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 lg:p-8 max-h-[85vh] md:max-h-[90vh] overflow-y-auto scroll-hidden">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Ficha de Inscrição
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="nome"
                  placeholder="Digite seu nome completo"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.nome ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.nome.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Digite seu e-mail"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("email", {
                    required: "E-mail é obrigatório",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Formato de e-mail inválido",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefone (apenas números)
                </label>
                <input
                  type="tel"
                  id="telefone"
                  placeholder="Ex: 94999999999"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.telefone ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("telefone", {
                    required: "Telefone é obrigatório",
                  })}
                />
                {errors.telefone && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.telefone.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="curso"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Curso
                </label>
                <select
                  id="curso"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors bg-white ${errors.curso ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("curso", { required: "Selecione um curso" })}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Escolha seu curso
                  </option>

                  {CURSOS_UNIFESSPA.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
                {errors.curso && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.curso.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="data_nascimento"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="data_nascimento"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.data_nascimento ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("data_nascimento", {
                    required: "Data de nascimento é obrigatória",
                  })}
                />
                {errors.data_nascimento && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.data_nascimento.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="matricula"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Matrícula (apenas números)
                </label>
                <input
                  type="text"
                  id="matricula"
                  placeholder="Digite sua matrícula"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.matricula ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"}`}
                  {...register("matricula", {
                    required: "Matrícula é obrigatória",
                  })}
                />
                {errors.matricula && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.matricula.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="relato"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Motivo da solicitação{" "}
                  <span className="text-gray-400 text-xs font-normal">
                    (Opcional)
                  </span>
                </label>
                <textarea
                  id="relato"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                  {...register("relato")}
                ></textarea>
              </div>

              <div className="pt-2">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 h-32 overflow-y-auto scroll-hidden mb-3 text-justify">
                  <strong className="block mb-1 text-gray-800">
                    Termo de Consentimento (LGPD)
                  </strong>
                  Ao selecionar a opção abaixo, autorizo o sistema PAPSE a
                  tratar meus dados pessoais e sensíveis para fins exclusivos de
                  triagem e atendimento psicológico. Estou ciente de que as
                  informações são sigilosas, restritas à equipe clínica e que
                  posso revogar este consentimento a qualquer momento. O
                  tratamento segue a Lei nº 13.709/2018.
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id="termo_aceite"
                      type="checkbox"
                      className={`w-4 h-4 border rounded focus:ring-3 focus:ring-orange-300 ${errors.termo_aceite ? "border-red-500" : "border-gray-300"}`}
                      {...register("termo_aceite", {
                        required:
                          "É necessário aceitar os termos para prosseguir.",
                      })}
                    />
                  </div>
                  <label
                    htmlFor="termo_aceite"
                    className="text-sm font-medium text-gray-700 select-none cursor-pointer"
                  >
                    Li e concordo com o Termo de Responsabilidade e Uso de
                    Dados.
                  </label>
                </div>
                {errors.termo_aceite && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.termo_aceite.message}
                  </span>
                )}
              </div>

              <div className="pt-2 pb-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF7A50] hover:bg-[#ff6130] text-white font-bold py-3 px-4 rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      ENVIANDO...
                    </>
                  ) : (
                    "ENVIAR INSCRIÇÃO"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 items-end justify-center relative">
          <div
            className="absolute inset-0 z-0 bg-[#FFF8F0]"
            style={{ clipPath: "polygon(80% 0%, 100% 0, 100% 100%, 0% 100%)" }}
          ></div>

          <div className="relative z-10 p-8 mb-0 flex items-end h-full">
            <img
              src={illustration}
              alt="Ilustração Estudante"
              className="max-w-full max-h-[85vh] object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative transform transition-all scale-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Inscrição Confirmada!
            </h3>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Recebemos seus dados com sucesso. A equipe do PAPSE entrará em
              contato em breve através do telefone ou email informado.
            </p>

            <button
              onClick={handleCloseModal}
              className="w-full bg-[#FF7A50] hover:bg-[#e05d35] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulario;
