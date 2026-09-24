import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx';
import Signup from "./pages/Signup.jsx";
import { Provider } from 'react-redux'
import store from './store/store.js'
import AdminGuard, {AdminGuardLoader} from './pages/AdminGuard.jsx'
import AdminUsersPage, {AdminUsersLoader} from './pages/AdminUsersPage.jsx'


const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />
    },
    {
      path: "/login",
      element: <Login />,

    },
    {
      path: "/signup",
      element: <Signup />
    },
    {
      path: "/admin",
      loader: AdminGuardLoader,
      element: <AdminGuard />,
      children:[ 
          {
          path: "users",
          element: <AdminUsersPage />,
          loader: AdminUsersLoader,
        }
      ]
    }
  ]
);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}>
      </RouterProvider>
    </Provider>
  </StrictMode>,
)
