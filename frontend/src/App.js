import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [showRegister, setShowRegister] = useState(false);

  if (user) return <Dashboard />;

  return showRegister ? (
    <Register setShowRegister={setShowRegister} />
  ) : (
    <Login setShowRegister={setShowRegister} />
  );
}

export default App;