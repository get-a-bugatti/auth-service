import { Outlet, redirect } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import api from "../api/axios.js";

export function AdminGuardLoader() {
    return api.get("/api/v1/users/me")
        .then((response) => {
            if (response.status === 200) {
                console.log("Response is :", response.data.data);
                
                if (response.data.data.role !== "admin") {
                    return redirect("/");
                }
                
                return response.data.data;
            }
        })
        .catch((error) => {
            if (error.response) {
                if (error.response.status === 401) {
                    return redirect("/login");
                } else if (error.response.status === 403) {
                    return redirect("/");
                }
            }
            console.error(error);
            throw error; 
        });
}



export default function AdminGuard() {
    const adminProfile = useLoaderData();

    console.log("AdminProfile is :", adminProfile);

    if (adminProfile.role !== "admin") {
        return <h1>Unauthorized</h1>;
    }

    return <Outlet context={{ adminProfile }} />; 
}