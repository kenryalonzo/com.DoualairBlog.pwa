
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashBoard from './pages/DashBoard';
import Projects from './pages/Projects';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/projects" element={<Projects />} />
          {/* Ajoutez d'autres routes au besoin */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;