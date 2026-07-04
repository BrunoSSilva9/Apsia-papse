const Footer = ({ className = "" }: { className?: string }) => {
  return (
    <footer className={`w-full py-4 text-center text-xs md:text-sm text-white/80 ${className}`}>
      <p>
        &copy; 2026 APSIA. Todos os direitos reservados. Desenvolvido por{" "}
        <a
          href="https://bruno-santos-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-inherit hover:text-orange-400 transition-colors"
        >
          Bruno da Silva dos Santos
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
