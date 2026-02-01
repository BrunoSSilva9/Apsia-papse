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
              O Programa de Acompanhamento Psicológico Estudantil (PAPSE) teve
              início em 2019 e foi criado com intuito de promover atendimento
              psicológico aos estudantes da Unifesspa. Estes atendimentos são
              feitos por discentes regularmente matriculados no Curso de
              Psicologia, com supervisão clínica, tendo como base a Teoria
              Psicanalítica. As sessões normalmente acontecem uma vez por
              semana, de forma presencial ou remota. Os principais objetivos do
              programa são: atender à demanda de atendimentos psicológicos de
              discentes da Unifesspa; oferecer supervisão clínica, colaborando
              na formação dos discentes de Psicologia selecionados no Programa;
              e contribuir para redução da taxa de evasão/retenção entre os
              discentes da Unifesspa, ocasionadas por problemas psicológicos. O
              grupo está atualmente composto por seis discentes bolsistas,
              quatro discentes voluntárias, uma técnica colaboradora e uma
              supervisora, docente na mesma faculdade (FAPSI). No ano de 2024,
              já foram atendidos 96 discentes. Contudo, desde o início do
              programa, mais de 300 estudantes de diversos cursos da Unifesspa
              já se beneficiaram. O PAPSE também oferece um atendimento de
              protocolo, em que são realizadas até cinco sessões, das quais,
              após serem concluídas, quem desejar segue aguardando
              disponibilidade de vaga para atendimento regular na fila de
              espera.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sobre;
