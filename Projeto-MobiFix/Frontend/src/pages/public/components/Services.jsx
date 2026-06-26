import { Wrench, Battery, Zap, Scooter, ShieldCheck, Clock } from 'lucide-react';

const services = [
  {
    title: 'Manutenção Preventiva',
    description: 'Verificação completa de travões, pneus e eletrónica para garantir a sua segurança.',
    icon: ShieldCheck,
  },
  {
    title: 'Reparação de Baterias',
    description: 'Diagnóstico e substituição de células de bateria para e-bikes e trotinetes elétricas.',
    icon: Battery,
  },
  {
    title: 'Diagnóstico Eletrónico',
    description: 'Deteção de erros no controlador e motor através de software especializado.',
    icon: Zap,
  },
  {
    title: 'Mecânica Geral',
    description: 'Substituição de pneus, pastilhas de travão e afinação de suspensões.',
    icon: Wrench,
  },
  {
    title: 'Serviço Personalizado',
    description: 'Recomendação de peças tendo em conta a sua trotinete.',
    icon: Scooter,
  },
  {
    title: 'Serviço Expresso',
    description: 'Reparações rápidas no próprio dia para que nunca fique parado.',
    icon: Clock,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-deep-slate mb-4 tracking-tight uppercase">
            Serviços Especializados
          </h2>
          <div className="w-20 h-1.5 bg-safety-orange mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Na MobiFix, tratamos o seu veículo com a precisão técnica que a micromobilidade exige.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-corporate-blue hover:bg-white hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-corporate-blue transition-colors">
                  <Icon size={28} className="text-corporate-blue group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-deep-slate mb-3">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}