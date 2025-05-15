import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    // .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (e.g., A, B)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter (e.g., a, b)")
    .regex(/[0-9]/, "Password must contain at least one number (e.g., 1, 2)")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g., @, #, $)"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, loading, error } = useAuth();
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const watchedFields = watch();

  // Reset error display when form values change
  useEffect(() => {
    setShowError(false);
  }, [watchedFields.email, watchedFields.password]);

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);

      // Check if there's a saved redirect path
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        navigate(redirectPath);
        // Clear the stored path after using it
        sessionStorage.removeItem("redirectPath");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-buffer-blue flex items-center justify-center text-white font-bold text-2xl">
              S
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to Socialyze</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link to="/signup" className="font-medium text-buffer-blue hover:text-buffer-lightBlue">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-buffer-blue hover:text-buffer-lightBlue"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && showError && (
                <div
                  className="p-2 px-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-md"
                  role="alert"
                >
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <a href="#" className="font-medium text-buffer-blue hover:text-buffer-lightBlue">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-buffer-blue hover:text-buffer-lightBlue">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
