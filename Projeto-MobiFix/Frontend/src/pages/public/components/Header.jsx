import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LogoMobifix from '../../../assets/mobifix_logo.png'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Catálogo', href: '/#parts-catalog' },
    { name: 'Serviços', href: '/#services' },
    { name: 'Qualidade', href: '/#trust-section'}
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center ${
      isScrolled || isAuthPage ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-40 h-40 flex items-center justify-center transition-transform group-hover:scale-110">
            <img src={LogoMobifix}/>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a key={item.name} href={item.href} className={`text-sm font-semibold transition-all hover:text-safety-orange ${
              isScrolled || isAuthPage ? 'text-deep-slate' : 'text-white'
            }`}>
              {item.name}
            </a>
          ))}
        </nav>

        {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
          {!isAuthPage && (
            <>
              {/* Passamos 'login' no state */}
              <Link 
                to="/auth" 
                state={{ mode: 'login' }} 
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  isScrolled ? 'text-deep-slate hover:bg-slate-100' : 'text-white hover:bg-white/10'
                }`}
              >
                Entrar
              </Link>

              <Link 
                to="/auth" 
                state={{ mode: 'register' }} 
                className="bg-safety-orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-orange-500/20 transition-all active:scale-95"
              >
                Criar Conta
              </Link>
              </>
            )}
          </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="text-deep-slate" size={28} />
          ) : (
            <Menu className={isScrolled || isAuthPage ? 'text-deep-slate' : 'text-white'} size={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-6 gap-4">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="text-deep-slate font-bold text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                {item.name}
              </a>
            ))}
            {!isAuthPage && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <Link 
                  to="/auth" 
                  state={{ mode: 'login' }}
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 text-center text-deep-slate font-bold border-2 border-slate-100 rounded-xl"
              >
                Entrar
                </Link>
                <Link 
                  to="/auth" 
                  state={{ mode: 'register' }}
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 text-center bg-safety-orange text-white font-bold rounded-xl shadow-lg"
                >
                  Registo
                </Link> 
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}