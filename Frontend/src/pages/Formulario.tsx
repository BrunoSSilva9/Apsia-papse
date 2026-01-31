import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import illustration from "../assets/images/formulario_illustration.png";

interface FormData {
  nome: string;
  matricula: string;
  telefone: string;
  curso: string;
  data_nascimento: string;
  relato: string;
}

const Formulario = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    matricula: "",
    telefone: "",
    curso: "",
    data_nascimento: "",
    relato: "",
  });

  const [status, setStatus] = useState(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    setStatus(true);

    try {
      const payload = {
        nome: formData.nome.trim(),
        matricula: formData.matricula.trim(),
        data_nascimento: formData.data_nascimento,
        data_inscricao: new Date().toISOString(),
        telefone: formData.telefone.trim() || undefined,
        curso: formData.curso || undefined,
        relato: formData.relato.trim() || undefined,
      };

      await api.post("/pacientes", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setFormData({
        nome: "",
        matricula: "",
        telefone: "",
        curso: "",
        data_nascimento: "",
        relato: "",
      });
    } catch (error: any) {
      console.error("Erro completo:", error);
    }finally{
        setStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FF6B3D] overflow-hidden flex flex-col relative">
      {/* Navbar */}
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

        <div className="md:hidden"></div>

        <div
          className="cursor-pointer flex flex-col gap-[5px] p-2"
          onClick={toggleMenu}
        >
          <div className="w-6 h-[3px] bg-white rounded-full"></div>
          <div className="w-6 h-[3px] bg-white rounded-full"></div>
          <div className="w-6 h-[3px] bg-white rounded-full"></div>
        </div>

        {menuOpen && (
          <div className="absolute top-16 right-5 bg-white rounded-lg shadow-lg py-2 flex flex-col min-w-[150px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/login"
              className="px-5 py-2 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors block"
            >
              LOGIN
            </Link>
            <a
              href="https://www.unifesspa.edu.br/"
              target="_blank"
              className="px-5 py-2 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors block"
            >
              UNIFESSPA
            </a>
          </div>
        )}
      </nav>

      <div className="flex flex-1 relative">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 z-10">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 font-sans">
              Ficha de Inscrição
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="Digite seu telefone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  required
                />
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
                  name="curso"
                  value={formData.curso}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white"
                  required
                >
                  <option value="" disabled>
                    Escolha seu curso
                  </option>
                  <option value="Engenharia de Computação">
                    Engenharia de Computação
                  </option>
                  <option value="Sistemas de Informação">
                    Sistemas de Informação
                  </option>
                  <option value="Psicologia">Psicologia</option>
                  <option value="Outro">Outro</option>
                </select>
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
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="matricula"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Matrícula
                </label>
                <input
                  type="text"
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="Digite sua matrícula"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="relato"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deseja escrever o motivo do porque acha que precisa de
                  acompanhamento psicológico?{" "}
                  <span className="text-gray-400 text-xs">(Opcional)</span>
                </label>
                <textarea
                  id="relato"
                  name="relato"
                  value={formData.relato}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status}
                  className="w-full bg-[#FF7A50] hover:bg-[#ff6130] text-white font-bold py-3 px-4 rounded-full transition-colors shadow-md disabled:opacity-70"
                >
                  {status? "ENVIANDO..." : "ENVIAR"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Illustration with Diagonal Background */}
        <div className="hidden lg:flex lg:w-1/2 items-end justify-center relative">
          {/* White Background */}
          <div
            className="absolute inset-0 z-0 bg-[#FFF8F0]"
            style={{ clipPath: "polygon(80% 0%, 100% 0, 100% 100%, 0% 100%)" }}
          ></div>

          <div className="relative z-10 p-8 mb-0 flex items-end h-full">
            <img
              src={illustration}
              alt="Ilustração Estudante"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulario;
