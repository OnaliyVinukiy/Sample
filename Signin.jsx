import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { PublicClientApplication } from '@azure/msal-browser';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const msalConfig = {
    auth: {
      clientId: '7888a1dc-f295-424f-88dc-5028e8e3e2b3',
      authority: 'https://login.microsoftonline.com/nsbm.ac.lk',
      redirectUri: 'http://localhost:5173/create-listing',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    },
  };
  const msalInstance = new PublicClientApplication(msalConfig);


  useEffect(() => {
    const initializeMsal = async () => {
      await msalInstance.initialize(); // Initialize MSAL instance
    };
    initializeMsal();
  }, [msalInstance]);


  const handleMicrosoftLogin = async () => {
    try {
      dispatch(signInStart());
  
      // Ensure MSAL instance is initialized before calling loginPopup
      await msalInstance.handleRedirectPromise();
  
      const loginResponse = await msalInstance.loginPopup();
  
      // Handle successful login
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleMicrosoftLogout = async () => {
    await msalInstance.logout();
    // Handle successful logout, you may want to clear user session state
    // and redirect the user to the login page or any other page
    navigate("/login");
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success == false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div class="max-w-lg p-3 mx-auto mt-16">
      <h1 class="text-3xl font-semibold text-center my-7">Sign In</h1>
      <form onSubmit={handleSubmit} class="flex flex-col gap-4">
        {/* <input
          type="text"
          placeholder="Username"
          className="p-3 border rounded-lg"
          id="username"
          onChange={handleChange}
        /> */}

        {/* <input
          type="text"
          placeholder="University Email"
          className="p-3 border rounded-lg"
          id="email"
          onChange={handleChange}
        />

        <input
          type="text"
          placeholder="Passsword"
          class="p-3 border rounded-lg"
          id="password"
          onChange={handleChange}
        /> */}
        {/* <button
          
          class="p-3 text-white uppercase rounded-lg cursor-pointer bg-slate-700 hover:opacity-95 disabled:opacity-80"
        >
          {(
            "Sign In"
          )}
        </button> */}
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          
          class="p-3 text-white uppercase rounded-lg cursor-pointer bg-slate-700 hover:opacity-95 disabled:opacity-80"
        >
          {(
            "Sign In with NSBM Email"
          )}
        </button>
      </form>
      {/* <div class="flex m-5 gap">
        <p>Do not have an account? </p>
        <Link to={"/sign-up"}>
          <span class="text-blue-700">Sign Up</span>
        </Link>
      </div> */}
      <div>
        <button type="button" class="mt-10 p-3 text-white uppercase rounded-lg cursor-pointer bg-slate-700 hover:opacity-95 disabled:opacity-80" onClick={handleMicrosoftLogout}>Logout</button>
      </div>
      {error && <p class="text-red-500 ">{error}</p>}
    </div>
  );
}

