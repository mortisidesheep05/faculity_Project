import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./store/authStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventForm from "./pages/EventForm";
import EventDetails from "./pages/EventDetails";
import Layout from "./components/layout/Layout";

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events/new" element={<EventForm />} />
          <Route path="events/edit/:id" element={<EventForm />} />
          <Route path="events/:id" element={<EventDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
