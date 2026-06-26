import { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowLeft, CheckCircle2, Loader2, Hash, MapPin, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router'; 
import { useLoginCliente, useRegistoCliente } from '../../hooks/useAuth';
import LogoMobifix from "../../assets/mobifix_logo.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [morada, setMorada] = useState('');
  const [telefone, setTelefone] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const loginMutation = useLoginCliente();
  const registerMutation = useRegistoCliente();

  const isPending = loginMutation.isPending || registerMutation.isPending;

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    } else if (location.state?.mode === 'login') {
      setIsLogin(true);
    }
  }, [location.state]);

  // 1. ATUALIZADO: Lógica de envio com NIF no Login
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Enviamos NIF e Password para o C#
      loginMutation.mutate({ nif, password }, {
        onSuccess: () => {
          navigate('/FixNRide/'); 
        }
      });
    } else {
      registerMutation.mutate({
        nome, nif, telefone, morada, email, password
      }, {
        onSuccess: () => {
          alert("Conta criada!");
          setIsLogin(true);
        }
      });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-safety-orange selection:text-white">
      
      {/* LADO ESQUERDO: Branding */}
      <div className="hidden lg:flex relative bg-deep-slate items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-corporate-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-safety-orange rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-60 h-35 flex ">
              <img src={LogoMobifix} alt="MobiFix Logo"/>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            {isLogin ? 'Bem-vindo de volta à revolução urbana.' : 'Junte-se à maior rede de micromobilidade.'}
          </h2>
          <p className="text-slate-400 text-lg">
            {isLogin 
              ? 'Aceda à sua conta para gerir as suas reservas e histórico de reparações.' 
              : 'Crie a sua conta hoje e comece a usufruir de peças exclusivas e assistência prioritária.'}
          </p>

          {!isLogin && (
            <div className="mt-10 space-y-4 text-left inline-block">
              {['Reservas Instantâneas', 'Histórico Digital', 'Descontos Premium'].map((text) => (
                <div key={text} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="text-safety-orange" size={20} />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
        <a href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-deep-slate transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Voltar ao Início
        </a>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-deep-slate mb-2">
              {isLogin ? 'Login de Cliente' : 'Criar Conta Cliente'}
            </h1>
            <p className="text-slate-500">
              {isLogin ? 'Introduza o seu NIF e password para entrar.' : 'Preencha o formulário para se registar.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* CAMPOS EXCLUSIVOS DE REGISTO */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-deep-slate mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="João Silva"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-deep-slate mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="tel" 
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="912 345 678"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-deep-slate mb-2">Morada</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={morada}
                      onChange={(e) => setMorada(e.target.value)}
                      placeholder="Rua da MobiFix, nº 10"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-deep-slate mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* NIF: AGORA VISÍVEL EM LOGIN E REGISTO */}
            <div>
              <label className="block text-sm font-bold text-deep-slate mb-2">NIF</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  maxLength={9}
                  value={nif}
                  onChange={(e) => setNif(e.target.value.replace(/\D/g, ""))} 
                  placeholder="123456789"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* PASSWORD: SEMPRE VISÍVEL */}
            <div>
              <label className="block text-sm font-bold text-deep-slate mb-2">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-corporate-blue focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm font-bold text-corporate-blue hover:underline">Esqueceu-se da password?</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isPending}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl shadow-xl transition-all active:scale-[0.98] mt-4 ${
                isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-deep-slate hover:bg-black cursor-pointer'
              }`}
            >
              {isPending && <Loader2 className="animate-spin" size={20} />}
              {isLogin 
                ? (loginMutation.isPending ? 'A entrar...' : 'Entrar') 
                : (registerMutation.isPending ? 'A criar conta...' : 'Finalizar Registo')
              }
            </button>        
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Ainda não tem conta?' : 'Já faz parte da MobiFix?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-safety-orange font-bold hover:underline cursor-pointer"
              >
                {isLogin ? 'Registe-se aqui' : 'Faça login agora'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}