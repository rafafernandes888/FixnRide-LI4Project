import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children, requiredRole}) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');

    if(!token){
        return <Navigate to="/auth" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
    console.warn(`Acesso negado: Esperado ${requiredRole}, obtido ${userRole}`);
    return <Navigate to="/FixNRide/" replace />;
  }

  // 3. Se estiver tudo OK, renderiza a página
  return children;
};

export default ProtectedRoute;