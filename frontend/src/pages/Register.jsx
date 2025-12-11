import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/common";
import { Button, Input, Card } from "../components/ui";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    birthday: "",
    gender: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.confirm
    ) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    const result = register(form);
    if (result.success) {
      navigate("/home");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 min-h-[calc(100vh-120px)] bg-gray-100">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <div className="text-center mb-4">
            <Logo size="lg" asLink={false} />
            <p className="text-gray-600 mt-2">Create a new account</p>
            <p className="text-gray-500 text-sm">It's quick and easy.</p>
          </div>

          <hr className="border-gray-300 mb-4" />

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex gap-3">
              <Input
                type="text"
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={onChange}
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Surname"
                value={form.lastName}
                onChange={onChange}
              />
            </div>

            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={onChange}
            />

            <Input
              type="password"
              name="password"
              placeholder="New password"
              value={form.password}
              onChange={onChange}
            />

            <Input
              type="password"
              name="confirm"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={onChange}
            />

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Date of birth
              </label>
              <Input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Gender</label>
              <div className="flex gap-3">
                {["Female", "Male", "Other"].map((gender) => (
                  <label
                    key={gender}
                    className="flex-1 flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <span>{gender}</span>
                    <input
                      type="radio"
                      name="gender"
                      value={gender.toLowerCase()}
                      onChange={onChange}
                      className="w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            <p className="text-xs text-gray-500 text-center">
              By clicking Sign Up, you agree to our Terms, Privacy Policy and
              Cookies Policy.
            </p>

            <Button
              type="submit"
              variant="success"
              size="lg"
              className="w-full font-bold"
            >
              Sign Up
            </Button>
          </form>

          <p className="text-center mt-4">
            <Link to="/login" className="text-[#1877f2] hover:underline">
              Already have an account?
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;
