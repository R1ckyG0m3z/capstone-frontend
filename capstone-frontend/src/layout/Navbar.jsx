import { NavLink } from "react-router";

import { useAuth } from "../auth/useAuth";

export default function Navbar() {
  const { token, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <NavLink to="/">
            <h1> Trail Kreweser</h1>
          </NavLink>
        </div>
        <ul className="nav-menu">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          {token ? (
            <>
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
