import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Stores from "./pages/Stores";
import StoreDetails from "./pages/StoreDetails";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import CreateStore from "./pages/CreateStore";
import Services from "./pages/Services";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import ManageProducts from "./pages/ManageProducts";
import ManageServices from "./pages/ManageServices";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/stores/:id" element={<StoreDetails />} />
      <Route path="/services" element={<Services />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/search" element={<Search />} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/create-store" element={<ProtectedRoute><CreateStore /></ProtectedRoute>} />
      <Route path="/profile/stores/:id/products" element={<ProtectedRoute><ManageProducts /></ProtectedRoute>} />
      <Route path="/profile/stores/:id/services" element={<ProtectedRoute><ManageServices /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
