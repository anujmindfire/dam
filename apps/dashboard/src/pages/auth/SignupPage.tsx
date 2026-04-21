import * as Yup from "yup";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import { useToast } from "../../components/ui/ToastProvider";
import { authService } from "../../services";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

const signupValidationSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Please enter a valid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: signupValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.signup(values);
        toast("Account created successfully. Please login.", "success");
        navigate("/login");
      } catch (err: any) {
        toast(err.response?.data?.message, "error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <Card
        className="w-full max-w-xl"
        style={{
          background: "var(--card-background)",
          padding: "var(--card-padding)",
        }}
      >
        <div className="flex flex-col items-start mb-10">
          <h2
            className="font-bold"
            style={{
              fontSize: "var(--heading-font-size)",
              color: "var(--text-color)",
              letterSpacing: "-0.02em",
            }}
          >
            Create Account
          </h2>
          <p
            className="mt-1 opacity-70"
            style={{
              fontSize: "var(--subheading-font-size)",
              color: "var(--text-color)",
            }}
          >
            Join AuraDAM today
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
          />

          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.password && formik.errors.password
                  ? formik.errors.password
                  : undefined
              }
            />
            <button
              type="button"
              className="absolute right-4 top-[25px] -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button type="submit" fullWidth isLoading={formik.isSubmitting} className="mt-4">
            Sign Up
          </Button>

          <div className="text-center pt-6">
            <p className="text-sm opacity-70 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--primary)] font-bold hover:underline decoration-2 underline-offset-4 ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
