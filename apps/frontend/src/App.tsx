
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext/provider";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import DoctorsList from "@/pages/DoctorsList";
import DoctorDetail from "@/pages/DoctorDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import UnauthorizedPage from "@/pages/Unauthorized";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

// Enable React Router v7 future flags to suppress warnings
// This is a temporary solution until we migrate to React Router v7
const enableFutureFlags = () => {
  window.history.pushState = new Proxy(window.history.pushState, {
    apply: (target, thisArg, argArray) => {
      // Add state object if it's missing (React Router v7 expectation)
      if (argArray.length < 3 || argArray[0] === null || argArray[0] === undefined) {
        argArray[0] = {};
      }
      return target.apply(thisArg, argArray);
    },
  });
};

// Call the function to enable future flags
enableFutureFlags();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* <NotificationProvider> */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<DoctorsList />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected routes - require authentication */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                {/* Admin routes - require specific permissions */}
                <Route path="/admin/users" element={
                  <ProtectedRoute permissionName="user:view_all">
                    <div>User Management</div>
                  </ProtectedRoute>
                } />

                <Route path="/admin/doctors" element={
                  <ProtectedRoute permissionName="doctor:view_all">
                    <div>Doctor Management</div>
                  </ProtectedRoute>
                } />

                <Route path="/admin/permissions" element={
                  <ProtectedRoute permissionName="template:view">
                    <div>Permission Management</div>
                  </ProtectedRoute>
                } />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            {/* Add ChatBot component here so it's available on all pages */}
            <ChatBot />
          </div>
        </BrowserRouter>
      </TooltipProvider>
      {/* </NotificationProvider> */}
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
