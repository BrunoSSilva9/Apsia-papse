import { Link } from "react-router-dom";
import HeaderMenu from "../components/shared/HeaderMenu";
import Footer from "../components/shared/Footer";

const Sobre = () => {
  return (
    <div className="h-screen w-full bg-[#5373d6] relative flex flex-col text-white font-sans overflow-y-auto overflow-x-hidden">
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
        {/* Título global removido para dar espaço aos títulos individuais das colunas */}

        <div className="w-full text-left grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-12">
          {/* Coluna 1 - APSIA */}
          <div className="bg-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="mb-6 border-b border-white/20 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide leading-snug mb-2 inline-block border-b-2 border-orange-400 pb-1">
                APSIA
              </h1>
              <h2 className="text-sm md:text-base font-medium text-white/90">
                Sistema de Gestão e Acompanhamento Psicológico Integrado Acadêmico
              </h2>
            </div>
            <div className="text-justify text-white/95 text-[15px] md:text-base leading-relaxed space-y-4">
              <p>
                O APSIA — Sistema de Gestão e Acompanhamento Psicológico Integrado Acadêmico — é uma solução web desenvolvida para apoiar a organização, o acompanhamento e a gestão de atendimentos psicológicos em contexto acadêmico. O sistema permite o registro de pacientes, a gestão de listas de espera, o acompanhamento de protocolos e atendimentos regulares, a criação de relatórios evolutivos e o controle de informações administrativas de forma segura.
              </p>
              <p>
                Desenvolvido com arquitetura modular, o sistema foi concebido para ser replicável e facilmente implantado em qualquer Instituição de Ensino Superior (IES) que possua curso de Psicologia ou estrutura equivalente.
              </p>
              <p>
                O sistema foi idealizado e construído por meio de uma parceria entre discentes e um professor orientador da <strong>Faculdade de Sistemas de Informação (FACSI)</strong> em colaboração com a <strong>Faculdade de Psicologia (FAPSI)</strong> da <strong>Universidade Federal do Sul e Sudeste do Pará (Unifesspa)</strong>.
              </p>
              <p>
                O APSIA foi pensado para contribuir com a eficiência dos fluxos internos, a rastreabilidade das ações e a proteção de dados sensíveis, respeitando rígidos princípios de confidencialidade e segurança institucional.
              </p>
            </div>
          </div>

          {/* Coluna 2 - PAPSE */}
          <div className="bg-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-white/20 shadow-xl">
            <div className="mb-6 border-b border-white/20 pb-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide leading-snug mb-2 inline-block border-b-2 border-orange-400 pb-1">
                PAPSE
              </h1>
              <h2 className="text-sm md:text-base font-medium text-white/90">
                Programa de Acompanhamento Psicológico Estudantil
              </h2>
            </div>
            <div className="text-justify text-white/95 text-[15px] md:text-base leading-relaxed space-y-4">
              <p>
                O Programa de Acompanhamento Psicológico Estudantil (PAPSE) teve início em 2019 com o intuito de promover atendimento psicológico aos estudantes da Unifesspa. Os atendimentos são realizados por discentes do curso de Psicologia sob supervisão clínica coordenada pela <strong>Prof.ª Dr.ª Katerine da Cruz Leal Sonoda</strong>, tendo como base a Teoria Psicanalítica.
              </p>
              <p>
                As sessões ocorrem presencial ou remotamente, buscando atender a demanda de saúde mental discente, oferecer campo de estágio supervisionado para os futuros psicólogos e contribuir na redução das taxas de evasão e retenção acadêmica ligadas a problemas psicológicos.
              </p>
              <p>
                O PAPSE atua inicialmente com um modelo de <strong>Atendimento de Protocolo</strong> (composto por até cinco sessões focadas). Após a conclusão, o paciente que desejar dar continuidade pode seguir aguardando disponibilidade na fila de espera para o <strong>Atendimento Regular</strong> contínuo.
              </p>
              <p>
                Apoiada por uma equipe engajada de bolsistas, voluntários, técnicos e docentes, a iniciativa já beneficiou <strong>mais de 300 estudantes</strong> (com aproximadamente 96 pacientes atendidos apenas no ano de 2024), consolidando-se como uma estrutura vital de acolhimento na universidade.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="w-full bg-black/20 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Sobre;
