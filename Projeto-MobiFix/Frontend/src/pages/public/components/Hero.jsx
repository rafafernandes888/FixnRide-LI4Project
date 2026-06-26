export default function Hero() {
  return (
    <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-deep-slate">
      
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1772456595053-98eb00580bb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHNjb290ZXIlMjBtb2Rlcm4lMjB1cmJhbnxlbnwxfHx8fDE3NzQ4MjI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Modern electric scooter in urban setting"
          className="w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        {/* Overlay Gradiente: Mais escuro à esquerda para legibilidade do texto */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full text-center lg:text-left">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Premium Parts for Your <br className="hidden lg:block" />
            <span className="text-safety-orange">Urban Ride</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Componentes de alta performance para trotinetes. 
            Assistência profissional garantida pela equipa <span className="text-white font-bold">MobiFix</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a 
              href={'#parts-catalog'}
            >
            <button
              className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-bold text-white bg-safety-orange hover:bg-orange-600 shadow-xl shadow-orange-900/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore o Catálogo
            </button>
            </a>
            <a href={'#services'}>
            <button className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all cursor-pointer">
              Nossos Serviços
            </button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator (Mouse Icon) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-safety-orange rounded-full animate-bounce"></div>
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2 text-center font-bold">Scroll</p>
      </div>

    </section>
  );
}