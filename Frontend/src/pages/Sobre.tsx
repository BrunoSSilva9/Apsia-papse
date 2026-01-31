import { useState } from 'react';
import { Link } from 'react-router-dom';

const Sobre = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-[#5579d8] to-[#4a69bd] relative overflow-hidden flex flex-col text-white font-sans">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#ff7f50] opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            {/* Navbar */}
            <nav className="flex flex-wrap justify-between items-center p-8 relative z-50">
                <div className="flex gap-4 md:gap-8 items-center">
                    <Link to="/" className="text-white/80 hover:text-white no-underline font-medium text-sm tracking-wide transition-colors">PRINCIPAL</Link>
                    <Link to="/sobre" className="text-white font-bold text-sm tracking-wide transition-colors">SOBRE</Link>
                    <Link to="/formulario" className="text-white/80 hover:text-white no-underline font-medium text-sm tracking-wide transition-colors">FORMULÁRIO</Link>
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
            <main className="flex-1 flex flex-col justify-center items-center px-6 md:px-20 pb-24 relative z-10">

                {/* Text Content */}
                <div className="max-w-4xl mx-auto space-y-8 w-full text-left">
                    <div className="space-y-4">
                        <h2 className="text-[#ff8c69] font-bold tracking-widest text-sm uppercase">Quem somos</h2>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-sm">
                            Sobre o PAPSE
                        </h1>
                        <div className="h-1 w-24 bg-[#ff8c69] rounded-full"></div>
                    </div>

                    <div className="prose prose-lg text-blue-50/90 leading-relaxed bg-white/5 p-8 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl mx-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <p className="mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget faucibus lectus, nec gravida eros. Sed vel fermentum leo, nec interdum eros. Nullam vel suscipit ligula, at interdum leo. Etiam non tempus neque.
                        </p>
                        <p className="mb-6">
                            Quisque molestie hendrerit massa ornare tristique. Pellentesque molestie nisl felis. Morbi at molestie massa, non malesuada orci. Vestibulum iaculis condimentum nunc, eget pretium orci volutpat sed.
                        </p>
                        <p>
                            Fusce consequat orci eu pulvinar rhoncus. Cras sit amet euismod elit. Mauris vestibulum sapien lobortis, posuere ante et, ultricies est. Phasellus ex metus, suscipit a enim id, commodo commodo arcu. Pellentesque vitae nunc mi. Vivamus id tortor fermentum turpis faucibus porta eget vitae nunc. Maecenas ultricies tellus risus, sed luctus nunc luctus vitae.
                        </p>
                         <p>
                            Fusce consequat orci eu pulvinar rhoncus. Cras sit amet euismod elit. Mauris vestibulum sapien lobortis, posuere ante et, ultricies est. Phasellus ex metus, suscipit a enim id, commodo commodo arcu. Pellentesque vitae nunc mi. Vivamus id tortor fermentum turpis faucibus porta eget vitae nunc. Maecenas ultricies tellus risus, sed luctus nunc luctus vitae.
                        </p>
                         <p>
                            Fusce consequat orci eu pulvinar rhoncus. Cras sit amet euismod elit. Mauris vestibulum sapien lobortis, posuere ante et, ultricies est. Phasellus ex metus, suscipit a enim id, commodo commodo arcu. Pellentesque vitae nunc mi. Vivamus id tortor fermentum turpis faucibus porta eget vitae nunc. Maecenas ultricies tellus risus, sed luctus nunc luctus vitae.
                        </p>
                         <p>
                            Fusce consequat orci eu pulvinar rhoncus. Cras sit amet euismod elit. Mauris vestibulum sapien lobortis, posuere ante et, ultricies est. Phasellus ex metus, suscipit a enim id, commodo commodo arcu. Pellentesque vitae nunc mi. Vivamus id tortor fermentum turpis faucibus porta eget vitae nunc. Maecenas ultricies tellus risus, sed luctus nunc luctus vitae.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Sobre;
