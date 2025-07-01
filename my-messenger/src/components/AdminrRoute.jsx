import { Navigate } from 'react-router-dom';


const isAuth = false; 

function AdminRoute() {
  if (!isAuth) {
   
    return <Navigate to="/adm-log" replace />;
  }


  return <AdminPage />;
}


export default AdminRoute;