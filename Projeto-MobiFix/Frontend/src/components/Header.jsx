import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({title, showBack = false}) {
    const navigate = useNavigate();

    return(
        <header className="sticky top-0 z-40 w-full bg-blue-600 text-white shadow-md">
            <div className="flex items-center gap-4 px-5 py-5">
                {showBack && (
                    <button 
                    onClick = {() => navigate(-1)}
                    className="p-1 -ml-1 rounded-full active:bg-blue-700 active:scale-90 transition-all"
                    aria-label="Voltar"
                    >
                
                    <ArrowLeft className="w-6 h-6" />
                 </button>   
                )}
                <h1 className={`text-xl font-bold tracking-tight ${!showBack ? 'ml-1' : ''}`}>
                    {title}
                </h1>
            </div>
        </header>     
    )
}