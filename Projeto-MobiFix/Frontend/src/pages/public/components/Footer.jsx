import { Mail, Phone, MapPin } from 'lucide-react';
import LogoMobifix from '../../../assets/mobifix_logo.png'

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Catálogo', href: '#parts-catalog' },
    { name: 'Serviços', href: '#services'},
    { name: 'Qualidade', href: '#trust-section'},
  ];

  return (
    <footer className="bg-deep-slate text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          
          {/* Company Info - Ocupa 5 colunas no desktop */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer w-fit">
              <div className="w-90 h-50 flex items-center  transition-transform group-hover:scale-110">
                <img src={LogoMobifix}/>
              </div>
            </div>
            
            <p className="text-slate-400 mb-8 max-w-sm leading-relaxed text-lg">
              O seu parceiro de confiança para peças premium de micromobilidade e serviços de reparação profissional. 
              Desde 2020 a manter a sua cidade em movimento.
            </p>
          </div>

          {/* Quick Links - Ocupa 3 colunas */}
          <div className="md:col-span-3">
            <h4 className="text-xl font-bold mb-8 relative w-fit">
              Explorar
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-safety-orange rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-400 hover:text-safety-orange transition-colors font-medium flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-safety-orange transition-all group-hover:w-4"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Ocupa 4 colunas */}
          <div className="md:col-span-4">
            <h4 className="text-xl font-bold mb-8 relative w-fit">
              Contacto
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-safety-orange rounded-full"></span>
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-safety-orange/10 transition-colors">
                  <MapPin size={24} className="text-safety-orange" />
                </div>
                <span className="text-slate-400 leading-snug">
                  Rua da Mobilidade, 123<br />
                  4700 Braga, Portugal
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-safety-orange/10 transition-colors">
                  <Phone size={24} className="text-safety-orange" />
                </div>
                <a href="tel:+351253123456" className="text-slate-400 hover:text-white transition-colors font-semibold">
                  +351 253 123 456
                </a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-safety-orange/10 transition-colors">
                  <Mail size={24} className="text-safety-orange" />
                </div>
                <a href="mailto:suporte@mobifix.pt" className="text-slate-400 hover:text-white transition-colors font-semibold">
                  suporte@mobifix.pt
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:row items-center justify-between gap-6 text-slate-500 text-sm font-medium">
          <p>© {currentYear} MobiFix Lda. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
          </div>
        </div>
      </div>
    </footer>
  );
}