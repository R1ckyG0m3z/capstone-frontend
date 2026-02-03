import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./useAuth";

/** A form that allows users to register for a new account */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onRegister = async (formData) => {
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await register({ email, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="form-section">
      <div className="form-container">
        <h1>Register for an account</h1>
        <form className="auth-form" action={onRegister}>
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
          <button className="btn-primary">Register</button>
          {error && <output>{error}</output>}
        </form>
        <div className="form-footer">
          <Link to="/login">Already have an account? Log in here.</Link>
        </div>
      </div>
    </div>
  );
}
