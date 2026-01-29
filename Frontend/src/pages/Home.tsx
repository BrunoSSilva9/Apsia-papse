import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import illustration from '../assets/images/home-illustration.svg';

const Home = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="h-screen w-screen bg-[#5579d8] relative overflow-hidden flex flex-col text-white font-sans select-none">
            {/* Background Shape */}
            <div className="absolute top-[20%] right-0 w-1/2 h-full bg-[#fff8e8] [clip-path:polygon(100%_0,_0_100%,_100%_100%)] z-0 hidden lg:block"></div>

            {/* Navbar */}
            <nav className="flex flex-wrap justify-between items-center p-8 relative z-50">
                <div className="flex gap-4 md:gap-8 items-center">
                    <Link to="/" className="text-white no-underline font-medium text-sm tracking-wide hover:opacity-80 transition-opacity">PRINCIPAL</Link>
                    <Link to="/sobre" className="text-white no-underline font-medium text-sm tracking-wide hover:opacity-80 transition-opacity">SOBRE</Link>
                    <Link to="/formulario" className="text-white no-underline font-medium text-sm tracking-wide hover:opacity-80 transition-opacity">FORMULÁRIO</Link>

                </div>

                <div className="md:hidden"></div>

                
                <div className="cursor-pointer flex flex-col gap-[5px] p-2" onClick={toggleMenu}>
                    <div className="w-6 h-[3px] bg-[#ff8c69] rounded-full"></div>
                    <div className="w-6 h-[3px] bg-[#ff8c69] rounded-full"></div>
                    <div className="w-6 h-[3px] bg-[#ff8c69] rounded-full"></div>
                </div>

                {menuOpen && (
                    <div className="absolute top-16 right-5 bg-white rounded-lg shadow-lg py-2 flex flex-col min-w-[150px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link to="/login" className="px-5 py-2 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors block">LOGIN</Link>
                        <a href="https://www.unifesspa.edu.br/" target='_blank' className="px-5 py-2 text-gray-800 text-sm font-semibold hover:bg-gray-100 transition-colors block">UNIFESSPA</a>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex justify-between items-center px-8 md:px-20 pb-24 relative z-10">
                <div className="flex-1 max-w-2xl z-10 text-center lg:text-left mx-auto lg:mx-0">
                    <h1 className="text-3xl md:text-[2.5rem] font-bold mb-4 md:mb-8 leading-tight tracking-wide border-b-4 border-[#0056b3] inline-block pb-2 drop-shadow-sm">
                        PROGRAMA DE ACOMPANHAMENTO<br />
                        PSICOLÓGICO ESTUDANTIL
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 md:mb-10 text-blue-50">Precisa de acompanhamento psicológico?</p>
                    <button
                        className="bg-[#ff7f50] text-white border-0 py-3 md:py-4 px-8 md:px-12 text-lg font-semibold rounded-full cursor-pointer shadow-lg hover:bg-[#ff6347] hover:-translate-y-0.5 transition-all transform active:scale-95"
                        onClick={() => navigate('/formulario')}
                    >
                        CLIQUE AQUI
                    </button>
                </div>

                {/* Illustration Image */}
                <div className="hidden lg:block absolute bottom-0 right-0 z-20 w-[45%] h-[85%] pointer-events-none flex items-end justify-end">
                    <img
                        src={illustration}
                        alt="Ilustração de saúde mental"
                        className="max-h-full max-w-full object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_85%,transparent)]"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 bg-[#243b75] text-white p-6 md:p-8 w-full lg:w-[60%] [clip-path:none] lg:[clip-path:polygon(0_0,_90%_0,_100%_100%,_0%_100%)] z-20 text-xs md:text-sm leading-relaxed">
                <p className="max-w-md">
                    Projeto desenvolvido pelo FAPSI em conjunto com a FACSI da Universidade Federal do Sul e Sudeste do Pará
                </p>
            </footer>
        </div>
    );
};

export default Home;
