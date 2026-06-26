import { Wrench, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Wrench,
    title: 'Técnicos Certificados',
    description: 'Técnicos certificados pela MobiFix com anos de experiência em reparação de micromobilidade elétrica.',
  },
  {
    icon: Shield,
    title: 'Partes Originais',
    description: 'Todas as peças são provenientes diretamente dos fabricantes, garantindo total compatibilidade e garantia.',
  },
  {
    icon: Clock,
    title: 'Manutenção Speedy',
    description: 'Serviço de reparação expresso disponível para a maioria das intervenções e instalações de acessórios.',
  },
];

export default function TrustSection() {
  return (
    <section id="trust-section" className="py-24 bg-white border-y border-slate-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group flex flex-col items-center text-center transition-all duration-300"
              >
                {/* Icon Container */}
                <div className="relative mb-8">
                  {/* Decorative Background Ring */}
                  <div className="absolute inset-0 bg-corporate-blue opacity-10 rounded-full scale-125 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  {/* Main Icon Circle */}
                  <div className="relative w-24 h-24 bg-corporate-blue rounded-full flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                    <Icon 
                      size={44} 
                      className="text-white transition-transform duration-500 group-hover:rotate-12" 
                    />
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-2xl font-black text-deep-slate mb-4 tracking-tight group-hover:text-corporate-blue transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-500 leading-relaxed font-medium max-w-sm">
                  {feature.description}
                </p>

                {/* Subtle Divider (Mobile only) */}
                {index !== features.length - 1 && (
                  <div className="w-12 h-1 bg-slate-100 mt-12 md:hidden"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}