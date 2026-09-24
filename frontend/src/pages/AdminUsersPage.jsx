import { useState } from "react";
import { redirect, useOutletContext } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { useLoaderData } from "react-router-dom";

export async function AdminUsersLoader() {
  api.get("/api/v1/admin/users").then((response) => {
    if (response.status === 200) {
      return response.data.data;
    }
  }).catch((error) => {
    if (error.response.status === 401) {
      return redirect("/login");
    } else if (error.response.status === 403) {
      return redirect("/");
    } else {
      console.error(error);
    }
  })
}

export default function AdminUsersPage() {

    const users = useLoaderData() || [];
    const {adminProfile} = useOutletContext();


    return (
      <div>
        <h1>Admin Panel</h1>
        <h2>Welcome Admin, {adminProfile.fullname}</h2>
        <ul>
            { 
                users.map((user) => {
                    return <li>{user.username}</li>
                })
            }
        </ul>
      </div>
    );
}