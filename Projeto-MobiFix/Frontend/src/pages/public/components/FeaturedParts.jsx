import { Lock, ShoppingBag, Eye } from 'lucide-react';
import { usePecas } from '../../../hooks/usePecas';

export default function FeaturedParts() {
  const { data: parts, isLoading, isError, error } = usePecas();
  const isLoggedIn = !!localStorage.getItem('token');


  if (parts) {
    console.log("Dados que vieram da API:", parts);
    console.log("Caminho da primeira imagem:", `../../../assets/${parts[0]?.imagem}`);
  }

  if (isLoading) return <div className="py-24 text-center">A carregar peças...</div>;

  if (isError) return <div className="py-24 text-center text-red-500">Erro: {error.message}</div>;

  return (
    <section className="py-24 bg-light-gray" id="parts-catalog">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-deep-slate mb-4 tracking-tight">
            Produtos do <span className="text-corporate-blue">Momento</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Explore a nossa seleção premium de componentes.
            Qualidade garantida pela MobiFix.
          </p>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {parts.slice(0,4).map((part) => (
            <div
              key={part.CodigoEAN}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100"
            >
              {/* Product Image Container */}
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={`/public/${part.Imagem}`}
                  alt={part.Nome}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md text-deep-slate text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-widest">
                    MobiFix Original
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-deep-slate mb-1 group-hover:text-corporate-blue transition-colors">
                  {part.Nome}
                </h3>
                <p className="text-2xl font-black text-corporate-blue mb-6">
                  {part.PVP}€
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    disabled={true}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer active:scale-95 ${'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                  >
                    <Lock size={16} />Login para Reservar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ver Mais Link */}
        <div className="mt-16 text-center">
          <a href="/FixNRide/catalogo" className="inline-flex items-center gap-2 text-corporate-blue font-bold hover:gap-4 transition-all">
            Ver Catálogo Completo
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}