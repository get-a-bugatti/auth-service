import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";

export default function Protected({
    authentication
}) {

   const authStatus = useSelector(state => state.auth.status);
   const location = useLocation();
   const from = location.state?.from?.pathname || "/"; 

   if (authentication !== authStatus) {
       return authentication ? (<Navigate to="/login" state={{from: location}} replace />) : (<Navigate to={from} replace />)
   }

   return <Outlet />;
}