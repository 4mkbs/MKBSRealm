import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/common";
import { Button, Input, Card } from "../components/ui";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    const result = login(form.email, form.password);
    if (result.success) {
      navigate("/home");
    }
  };

  return (
    <div className="flex justify-center items-center flex-1 bg-gray-100 py-10 min-h-[calc(100vh-120px)]">
      <div className="flex flex-col lg:flex-row w-full max-w-[980px] p-5 box-border items-center gap-8">
        {/* Left section */}
        <div className="flex-1 text-center lg:text-left lg:pr-8">
          <Logo size="2xl" asLink={false} />
          <h2 className="text-[#1c1e21] text-xl lg:text-2xl font-normal leading-[32px] mt-4">
            MKBS Realm helps you connect and share with the people in your life.
          </h2>
        </div>

        {/* Right section */}
        <div className="w-full max-w-[396px]">
          <Card className="p-5">
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                type="email"
                name="email"
                placeholder="Email address or phone number"
                value={form.email}
                onChange={onChange}
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
              />

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full font-bold">
                Log in
              </Button>

              <a
                href="#"
                className="block text-center text-[#1877f2] text-sm hover:underline"
              >
                Forgotten password?
              </a>

              <hr className="border-t border-[#dddfe2] my-2" />

              <Link to="/register" className="block">
                <Button
                  variant="success"
                  size="lg"
                  className="w-full font-bold"
                >
                  Create new account
                </Button>
              </Link>
            </form>
          </Card>

          <p className="text-center text-sm text-[#606770] mt-5">
            <a href="#" className="font-bold hover:underline">
              Create a Page
            </a>{" "}
            for a celebrity, brand or business.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
