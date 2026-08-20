import {
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Activity,
  BrainCircuit,
  Shield,
  LockKeyhole,
  Radar,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/api";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        username: name,
        email: email,
        password: password,
      });

      alert(response.data.message);

      navigate("/login");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 rounded-3xl flex  ">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-slate-800">
        {/* GLOW */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* LOGO */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldCheck size={40} className="text-white" />
            </div>

            <div>
              <h1 className="text-5xl font-bold text-white">Sentinel AI</h1>

              <p className="text-blue-400 text-lg mt-2">
                Enterprise IDS Platform
              </p>
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight mb-6">
            Secure Your Network with Intelligent Cyber Defense
          </h2>

          {/* DESCRIPTION */}
          <p className="text-slate-400 text-lg leading-8 max-w-2xl">
            Create your Sentinel AI account to access advanced intrusion
            detection, AI-powered threat analysis, and enterprise-grade network
            security monitoring.
          </p>

          {/* FEATURES */}
          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-4">
              <LockKeyhole size={24} className="text-blue-400" />
              <div>
                <p className="text-slate-300 text-lg">
                  Secure User Authentication
                </p>

                <p className="text-slate-400">
                  Protect access with encrypted credentials and secure login.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <BrainCircuit size={24} className="text-cyan-400" />
              <div>
                <p className="text-slate-300 text-lg">
                  Machine Learning Detection
                </p>

                <p className="text-slate-400">
                  Detect abnormal network behavior using intelligent ML models.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Radar size={24} className="text-green-400" />
              <div>
                <p className="text-slate-300 text-lg">
                  Enterprise Security Platform
                </p>

                <p className="text-slate-400">
                  Monitor, analyze, and respond to network threats from a
                  centralized dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* MOBILE LOGO */}
          <div className="md:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-10">
              <ShieldCheck size={52} className="text-blue-500" />
              <div>
                <h1 className="text-4xl font-bold text-white">Sentinel AI</h1>

                <p className="text-slate-400 mt-2">Enterprise IDS Platform</p>
              </div>
            </div>
          </div>

          {/* REGISTER CARD */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-md px-16 pt-16 pb-10 shadow-2xl shadow-blue-500/10">
            {/* HEADER */}
            <div className="mt-8 mb-8">
              <div className="h-4"></div>

              <h2
                className="text-4xl font-bold text-white"
                style={{ marginLeft: "10px" }}
              >
                Create Account
              </h2>

              <p className="text-slate-400 mt-2" style={{ marginLeft: "10px" }}>
                Register to access Sentinel AI dashboard
              </p>
            </div>

            {/* FORM */}
            <div className="w-full mx-auto">
              <form onSubmit={handleRegister} className="space-y-5 mt-6">
                <div className="h-4"></div>

                {/* FULL NAME */}
                <div>
                  <label
                    className="block text-slate-300 mb-2"
                    style={{ marginLeft: "5px" }}
                  >
                    Full Name
                  </label>

                  <div className="flex items-center h-14 px-5 gap-2 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition">
                    <User
                      size={20}
                      className="ml-4 text-slate-500 flex-shrink-0"
                      style={{ marginLeft: "10px" }}
                    />

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 h-full bg-transparent outline-none text-white placeholder:text-slate-500 ml-3 pr-4"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="h-4"></div>

                <div>
                  <label className="block text-slate-300 mb-2">
                    Email Address
                  </label>

                  <div className="flex items-center h-12 px-5 gap-2 bg-slate-800 border border-slate-700 rounded-xl  hover:border-blue-500 transition">
                    <Mail
                      size={18}
                      className="text-slate-500"
                      style={{ marginLeft: "10px" }}
                    />

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-full bg-transparent outline-none text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div className="h-4"></div>
                <div>
                  <label className="block text-slate-300 mb-2">Password</label>

                  <div className="flex items-center gap-2 h-12 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition">
                    <Lock
                      size={18}
                      className="ml-4 mr-4 text-slate-500"
                      style={{ marginLeft: "10px" }}
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent pl-1 outline-none text-white placeholder:text-slate-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="h-4"></div>
                <div>
                  <label className="block text-slate-300 mb-2 justify-center">
                    Confirm Password
                  </label>

                  <div className="flex items-center h-14 px-5 gap-2 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition">
                    <Lock
                      size={20}
                      className="ml-4 text-slate-500 flex-shrink-0"
                      style={{ marginLeft: "10px" }}
                    />

                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 h-full bg-transparent outline-none text-white placeholder:text-slate-500 ml-3"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 text-slate-400 hover:text-white transition"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* SPACE */}
                <div className="h-6"></div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] transition py-3.5 rounded-xl text-white font-semibold text-lg shadow-lg shadow-blue-500/20"
                >
                  Create Account
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="h-2"></div>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-800"></div>

              <span className="text-slate-500 text-base">OR</span>

              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* FOOTER */}

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
