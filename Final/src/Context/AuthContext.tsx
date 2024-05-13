import React, { createContext, useContext, useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError, UserCredential } from "firebase/auth";
import { useRouter } from "next/router";
import { firebaseApp } from "../Firebase/firebaseConfig";

interface IUser {
  email: string;
  password: string;
}

interface IAuthContext {
  createUser: (user: IUser) => Promise<UserCredential>;
  signInUser: (user: IUser) => Promise<UserCredential>;
  authError: string | null;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const authInstance = getAuth(firebaseApp);
  const router = useRouter();

  const createUser = async (user: IUser) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, user.email, user.password);
      setAuthError(null);
      return userCredential;
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    }
  };

  const signInUser = async (user: IUser) => {
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, user.email, user.password);
      setAuthError(null);
      router.push("/home");
      return userCredential;
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    }
  };

  const handleAuthError = (error: AuthError) => {
    let errorMessage = "An error occurred";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email already in use";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Weak password";
    } else {
      errorMessage = error.message;
    }
    setAuthError(errorMessage);
  };

  const value: IAuthContext = {
    createUser,
    signInUser,
    authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
