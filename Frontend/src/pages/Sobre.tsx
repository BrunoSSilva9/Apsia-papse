import { Link } from "react-router-dom";
import HeaderMenu from "../components/shared/HeaderMenu";

const Sobre = () => {
  return (
    <div className="min-h-screen w-full bg-[#5373d6] relative flex flex-col text-white font-sans">
      <nav className="flex justify-between items-center px-8 py-6 relative z-50">
        <div className="flex gap-8 items-center">
          <Link
            to="/"
            className="text-white/80 hover:text-white no-underline text-xs md:text-sm tracking-wide transition-colors uppercase"
          >
            PRINCIPAL
          </Link>
          <Link
            to="/sobre"
            className="text-white font-bold text-xs md:text-sm tracking-wide transition-colors uppercase"
          >
            SOBRE
          </Link>
          <Link
            to="/formulario"
            className="text-white/80 hover:text-white no-underline text-xs md:text-sm tracking-wide transition-colors uppercase"
          >
            FORMULÁRIO
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-1">
          <HeaderMenu variant="guest" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-6 md:px-20 pt-10 md:pt-20 pb-10 relative z-10 w-full max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider leading-tight">
            PROGRAMA DE ACOMPANHAMENTO
          </h1>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider leading-tight">
            PSICOLÓGICO ESTUDANTIL
          </h1>
        </div>

        <div className="w-full text-left">
          <div className="flex gap-6 mb-6">
            <div className="pb-1 border-b-2 border-white">
              <span className="font-bold text-lg uppercase tracking-wide">
                SOBRE O PAPSE
              </span>
            </div>
          </div>

          <div className="text-justify text-white/90 text-[15px] md:text-base leading-relaxed space-y-4 max-w-4xl">
            <p>
              O Sistema de Gestão do Programa de Acompanhamento Psicológico
              Estudantil (PAPSE) é uma plataforma digital voltada para a
              Informática em Saúde e gestão do cuidado em ambiente acadêmico. A
              ferramenta web foi arquitetada de forma modular para ser
              implantada em qualquer Instituição de Ensino Superior (IES) do
              país. <br />
              Seu público-alvo institucional abrange universidades e faculdades
              que possuam o curso de Psicologia (ou clínicas-escola similares) e
              que buscam otimizar a prestação de serviços de saúde mental. A
              plataforma opera em uma dupla frente de impacto:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Foco no Paciente (Permanência Estudantil):</strong>{" "}
                Acolhe a comunidade acadêmica, democratizando o acesso ao
                atendimento psicológico para mitigar transtornos mentais que
                impactam diretamente nas taxas de evasão e retenção
                universitária.
              </li>
              <li>
                <strong>Foco no Profissional (Formação de Excelência):</strong>{" "}
                Oferece um ambiente seguro e digital para que discentes de
                Psicologia (estagiários, voluntários ou bolsistas) realizem a
                gestão de seus pacientes e prontuários evolutivos, sob a
                rigorosa orientação de docentes e supervisores clínicos.
              </li>
            </ul>

            <p>
              Para lidar com a alta demanda inerente às IES, o sistema
              automatiza fluxos clínicos universais. Ele gerencia desde a
              triagem inteligente até a categorização de pacientes em diferentes
              modalidades terapêuticas, como os atendimentos de protocolo
              (intervenções breves e focadas, de até cinco sessões) e o
              encaminhamento organizado para listas de atendimento regular.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sobre;
