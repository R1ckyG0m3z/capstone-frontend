import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./useAuth";

/** A form that allows users to log into an existing account. */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onLogin = async (formData) => {
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await login({ email, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="form-section">
      <div className="form-container">
        <h1>Log in to your account</h1>
        <form className="auth-form" action={onLogin}>
          <div className="form-group">
            <label>
              Email
              <input type="email" name="email" required />
            </label>
          </div>
          <div className="form-group">
            <label>
              Password
              <input type="password" name="password" required />
            </label>
          </div>
          <button className="btn-primary">Login</button>
          {error && <output>{error}</output>}
        </form>
        <div className="form-footer">
          <Link to="/register">Need an account? Register here.</Link>
        </div>
      </div>
    </div>
  );
}
