import { Home, Scooter, Wrench, ShoppingCart, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { icon: Home, label: "Início", path: "/FixNRide/" },
        { icon: Scooter, label: "Trotinetes", path: "/FixNRide/trotinetes" },
        { icon: Wrench, label: "Reparações", path: "/FixNRide/reparacoes" },
        { icon: ShoppingCart, label: "Catálogo", path: "/FixNRide/catalogo" },
        { icon: FileText, label: "Faturas", path: "/FixNRide/faturas" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] z-50">   
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button key={item.path} 
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 active:bg-slate-50"
                        >
                            <Icon
                            className={`w-6 h-6 transition-colors ${
                            isActive ? "text-blue-600" : "text-slate-500"
                            }`}/>

                            <span
                            className={`text-xs mt-1 font-medium ${
                            isActive ? "text-blue-600" : "text-slate-500"
                            }`}>
                            {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}