import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthHandler from "./components/AuthHandler";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { PrivateRoute } from "./components/PrivateRoute";
import ThemeProvider from "./components/ThemeProvider";
import About from "./pages/About";
import DashBoard from "./pages/DashBoard";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthHandler />
        <div className="min-h-screen bg-base-100 transition-colors duration-200">
          <Header />
          <main className="pt-24 px-4 sm:px-6 lg:px-8 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route
                path="/signup"
                element={<Navigate to="/sign-up" replace />}
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute showAccessDenied={true}>
                    <DashBoard />
                  </PrivateRoute>
                }
              />
              <Route path="/projects" element={<Projects />} />
              <Route path="/auth-handler" element={<AuthHandler />} />

              {/* Ajoutez d'autres routes au besoin */}
            </Routes>
          </main>
        </div>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </Router>
  );
}

export default App;
