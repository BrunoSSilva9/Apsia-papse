import { Link } from "react-router-dom";
import HeaderMenu from "../components/shared/HeaderMenu";

const Sobre = () => {
  return (
    <div className="h-screen w-full bg-[#5373d6] relative flex flex-col text-white font-sans overflow-y-auto md:overflow-hidden">
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

      <main className="flex-1 flex flex-col justify-start pt-8 items-center px-6 md:px-16 relative z-10 w-full max-w-5xl mx-auto">
        <div className="text-center mb-6 space-y-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-snug">
            PROGRAMA DE ACOMPANHAMENTO
          </h1>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-snug">
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

          <div className="text-justify text-white/90 text-[15px] md:text-base leading-relaxed space-y-3 max-w-4xl">
            <p>
              O Sistema de Gestão do Programa de Acompanhamento Psicológico
              Estudantil (PAPSE) é uma plataforma digital voltada à Informática
              em Saúde e à gestão do cuidado psicológico em ambiente acadêmico.
              Desenvolvido com arquitetura modular, o sistema foi concebido para
              ser replicável e implantado em qualquer Instituição de Ensino
              Superior (IES) que possua curso de Psicologia ou estrutura
              equivalente.
            </p>

            <p>
              A solução organiza e amplia o acesso ao atendimento psicológico da
              comunidade acadêmica, contribuindo para a permanência estudantil,
              ao mesmo tempo em que oferece um ambiente digital seguro para que
              discentes de Psicologia realizem a gestão de pacientes e registros
              clínicos sob supervisão sistemática de docentes responsáveis. Para
              lidar com a demanda institucional, o PAPSE automatiza fluxos
              clínicos, estruturando desde a triagem inicial até a organização
              dos pacientes em modalidades como atendimentos de protocolo e
              listas de acompanhamento regular, promovendo eficiência,
              rastreabilidade e padronização do cuidado.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sobre;
