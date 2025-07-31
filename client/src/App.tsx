import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DashBoard from "./pages/DashBoard";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthHandler from "./components/AuthHandler";
import ThemeProvider from "./components/ThemeProvider";

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
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/auth-handler" element={<AuthHandler />} />

              {/* Ajoutez d'autres routes au besoin */}
            </Routes>
          </main>
        </div>
        <Footer />
      </ThemeProvider>
    </Router>
  );
}

export default App;
