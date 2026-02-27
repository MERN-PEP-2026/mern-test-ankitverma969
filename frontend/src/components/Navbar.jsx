import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="dashboard-nav">
      <Link to="/dashboard" className="nav-brand">
        Student Course Manager
      </Link>
      <div className="nav-links">
        <NavLink
          to="/courses"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`.trim()}
        >
          Courses
        </NavLink>
        <NavLink
          to="/activity-log"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`.trim()}
        >
          Activity Log
        </NavLink>
        <NavLink
          to="/security-logs"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`.trim()}
        >
          Security & Device Logs
        </NavLink>
      </div>
      <button type="button" className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;