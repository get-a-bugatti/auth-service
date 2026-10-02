import {  redirect } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import api from "../api/axios.js";

export async function UsersPageLoader() {
    return api.get("/api/v1/users/me")
        .then((response) => {
            if (response.status === 200) {
                
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



export default function UsersPage() {
    const userProfile = useLoaderData();
    console.log("UserProfile is ", userProfile);
    const isAdmin = userProfile?.role === "admin";

    function redirectToAdminPage() {
        return redirect("/admin/users")
    }



    let displayElem = <h1>Hello {isAdmin ? "Admin" : "User"} {`${userProfile.username}`}</h1>;

    return displayElem;

}