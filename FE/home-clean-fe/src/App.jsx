import { BrowserRouter as Router } from "react-router-dom"
import Layout from "./layouts/Layout"
import { AuthContextProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Layout />
      </Router>
    </AuthContextProvider>

  )
}

export default App
