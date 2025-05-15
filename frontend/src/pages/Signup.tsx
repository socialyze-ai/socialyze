import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter (e.g., A, B)")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter (e.g., a, b)")
      .regex(/[0-9]/, "Password must contain at least one number (e.g., 1, 2)")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character (e.g., @, #, $)",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { signup, loading, error } = useAuth();
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility
  const watchedFields = watch();
  const navigate = useNavigate();

  // Reset error display when form values change
  useEffect(() => {
    setShowError(false);
  }, [
    watchedFields.email,
    watchedFields.password,
    watchedFields.confirmPassword,
    watchedFields.name,
  ]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup(data.name, data.email, data.password, data.confirmPassword);

      navigate("/otp");
    } catch (error: any) {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-buffer-blue flex items-center justify-center text-white font-bold text-2xl">
              S
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-buffer-blue hover:text-buffer-lightBlue">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>

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
                <Label htmlFor="password">Password</Label>
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
                {!errors.password && (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
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
                {isSubmitting || loading ? "Creating account..." : "Create account"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            By signing up, you agree to our{" "}
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

export default Signup;
