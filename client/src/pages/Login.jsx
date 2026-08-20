import {
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Activity,
  Cpu,
} from "lucide-react";

import api from "../api/api";

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data.data;

      // Save authentication details
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", user.username);
      localStorage.setItem("userEmail", user.email);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("savedEmail");
      }

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };

  useEffect(() => {
    const remember = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("savedEmail");

    if (remember === "true" && savedEmail) {
      setRememberMe(true);
      setEmail(savedEmail);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ================= LEFT PANEL ================= */}

      <div className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-slate-800">
        {/* Background Glow */}

        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-cyan-500/10 to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-center px-20">
          {/* Logo */}

          <div className="flex items-center gap-5 mb-12">
            <div className="bg-blue-600 rounded-3xl p-5 shadow-xl shadow-blue-500/20">
              <ShieldCheck size={46} className="text-white" />
            </div>

            <div>
              <h1 className="text-5xl font-bold text-white tracking-tight">
                Sentinel AI
              </h1>

              <p className="text-blue-400 mt-2 text-lg">
                Enterprise Intrusion Detection Platform
              </p>
            </div>
          </div>

          {/* Heading */}

          <h2 className="text-3xl font-bold text-white leading-tight max-w-lg">
            AI Powered Network Intrusion Detection & Threat Intelligence
          </h2>

          {/* Description */}

          <p className="text-slate-400 text-lg leading-8 mt-8 max-w-lg">
            Securely access the Sentinel AI platform to monitor network traffic,
            detect cyber threats using machine learning, and analyze security
            events in real time.
          </p>

          {/* Features */}

          <div className="mt-14 space-y-7">
            <div className="flex items-center gap-5">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <Activity className="text-blue-400" />
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold">
                  Real-Time Network Monitoring
                </h3>

                <p className="text-slate-400">
                  Continuously monitor incoming and outgoing network traffic.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <Cpu className="text-cyan-400" />
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold">
                  AI-Based Threat Detection
                </h3>

                <p className="text-slate-400">
                  Identify malicious activities using machine learning
                  algorithms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="bg-green-500/20 p-3 rounded-xl">
                <Shield className="text-green-400" />
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold">
                  Security Analytics Dashboard
                </h3>

                <p className="text-slate-400">
                  Visualize attacks, alerts, and system performance through
                  interactive dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Mobile Logo */}

          <div className="lg:hidden text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-10">
              <ShieldCheck size={52} className="text-blue-500" />
              <div>
                <h1 className="text-4xl font-bold text-white">Sentinel AI</h1>

                <p className="text-slate-400 mt-2">Enterprise IDS Platform</p>
              </div>
            </div>
          </div>

          {/* Login Card */}

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-blue-500/10 rounded-md px-16 pt-16 pb-10">
            <div className="mt-8 mb-8">
              <div className="h-4"></div>

              <div className="mx-auto w-full pt-10 pb-8">
                <div className="ml-6">
                  <h2
                    className="text-4xl font-bold text-white"
                    style={{ marginLeft: "10px" }}
                  >
                    Welcome Back
                  </h2>
                </div>

                <p
                  className="text-slate-400 mt-4 mb-8 leading-7"
                  style={{ marginLeft: "10px" }}
                >
                  Securely sign in to continue to your Sentinel AI dashboard.
                </p>
                <div className="w-full mx-auto">
                  <form onSubmit={handleLogin} className="space-y-5 mt-6">
                    {/* EMAIL FIELD */}

                    <div className="h-4"></div>
                    <div>
                      <label
                        className="block text-slate-300 font-medium mb-3 justify-between flex items-center"
                        style={{ marginLeft: "5px" }}
                      >
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

                    {/* PASSWORD FIELD */}
                    <div className="h-4"></div>

                    <div>
                      <label
                        className="block text-slate-300 font-medium mb-3"
                        style={{ marginLeft: "5px" }}
                      >
                        Password
                      </label>

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
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* REMEMBER ME */}
                    <div className="h-4"></div>

                    <div className="flex items-center justify-between mt-2 mb-6">
                      <label className="flex items-center gap-3 text-slate-400 text-base">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 accent-blue-600"
                          style={{ marginLeft: "5px" }}
                        />
                        Remember me
                      </label>

                      <button
                        type="button"
                        className="text-base text-blue-400 hover:text-blue-300 transition"
                        style={{ marginRight: "5px" }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="mt-5"></div>

                    {/* LOGIN BUTTON */}

                    <div className="h-2"></div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-4 mt-2 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      Sign In
                      <ArrowRight size={20} />
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

                <div className="text-center mt-2">
                  <p className="text-slate-400">New to Sentinel AI?</p>

                  <Link
                    to="/register"
                    className="inline-block mt-2 text-blue-400 hover:text-blue-300 font-semibold transition"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
