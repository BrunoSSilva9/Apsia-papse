interface FooterProps {
  className?: string;
  shortText?: boolean;
}

const Footer = ({ className = "", shortText = false }: FooterProps) => {
  return (
    <footer className={`w-full py-4 text-center text-xs md:text-sm text-white/80 ${className}`}>
      <p>
        &copy; 2026{" "}
        <a
          href="https://bruno-santos-portfolio.vercel.app/#projects"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-300 hover:text-orange-400 hover:underline transition-colors"
        >
          APSIA
        </a>
        {shortText 
          ? ". Todos os direitos reservados." 
          : " — Sistema de Gestão e Acompanhamento Psicológico Integrado Acadêmico. Todos os direitos reservados."}
      </p>
    </footer>
  );
};

export default Footer;
