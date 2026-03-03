import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./assets/components/home";
import Login from "./assets/components/login";
import Signup from "./assets/components/signup";
import LandingPage from "./assets/components/landingpage"; // ADD THIS IMPORT
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/landingpage" element={<LandingPage />} />{" "}
        {/* ADD THIS ROUTE */}
      </Routes>
    </Router>
  );
}

export default App;
