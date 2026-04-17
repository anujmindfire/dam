import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import { useToast } from "../../components/Providers/ToastProvider";
import { authService } from "../../api";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response.data.data);
      toast("Successfully authenticated", "success");
      navigate("/");
    } catch (err: any) {
      toast(
        err.response?.data?.message || "Authentication failed. Please check your credentials.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div
        className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[160px] animate-pulse"
        style={{ backgroundColor: "#8b5cf6" }}
      />
      <div
        className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-10 blur-[160px]"
        style={{ backgroundColor: "#06b6d4" }}
      />
      <div
        className="absolute bottom-[40%] left-[10%] w-[100px] h-[100px] rounded-full opacity-20 blur-[60px]"
        style={{ backgroundColor: "#d946ef" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[540px] z-10"
      >
        <div
          className="p-10 rounded-[32px] relative overflow-hidden border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-hover rounded-3xl mb-8 shadow-glow ring-4 ring-white/5"
            >
              <ShieldCheck className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome Back</h1>
            <p className="text-text-muted text-lg font-light">
              Access your digital asset ecosystem
            </p>
          </div>

          {/* Spacer */}
          <div className="h-8 w-full"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col w-full items-center">
            <div className="w-full max-w-[360px]">
              <div className="flex flex-col gap-6 w-full">
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-text-muted ml-1 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="input-container-icon group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: "64px" }}
                      className="input-styled w-full text-[16px]"
                      placeholder="name@company.com"
                      required
                    />
                    <div className="icon-wrapper">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-text-muted ml-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="input-container-icon group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: "64px" }}
                      className="input-styled w-full text-[16px]"
                      placeholder="••••••••"
                      required
                    />
                    <div className="icon-wrapper">
                      <Lock className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacer before button */}
              <div className="h-10 w-full shrink-0"></div>

              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full bg-primary hover:bg-primary-hover text-white font-bold py-4.5 rounded-2xl transition-all shadow-glow flex items-center justify-center gap-3 text-lg ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Spacer */}
          <div className="h-8 w-full"></div>

          {/* Footer */}
          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-text-muted font-medium">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-white hover:text-primary transition-colors font-bold ml-1"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
