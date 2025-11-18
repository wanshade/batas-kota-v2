"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import SuccessModal from "@/components/ui/success-modal";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Trophy,
  Clock,
} from "lucide-react";

// Zod schema for form validation
const registrationSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(20, "Phone number must be less than 20 digits")
      .regex(/^[+]?[0-9\s-]+$/, "Please enter a valid phone number"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "bg-gray-300",
  });

  // Calculate form completion progress
  useEffect(() => {
    const fields = ["name", "email", "phone", "password", "confirmPassword"];
    const completedFields = fields.filter(
      (field) => formData[field as keyof RegistrationFormData].trim() !== ""
    );
    setFormProgress((completedFields.length / fields.length) * 100);
  }, [formData]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 6) score += 20;
    else feedback.push("Use at least 6 characters");

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push("Include uppercase letter");

    if (/[a-z]/.test(password)) score += 20;
    else feedback.push("Include lowercase letter");

    if (/[0-9]/.test(password)) score += 20;
    else feedback.push("Include a number");

    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push("Include special character");

    let color = "bg-red-500";
    if (score >= 80) color = "bg-green-500";
    else if (score >= 60) color = "bg-yellow-500";
    else if (score >= 40) color = "bg-orange-500";

    return { score, feedback, color };
  };

  // Real-time validation using Zod
  const validateField = (field: keyof RegistrationFormData, value: string) => {
    const currentFormData = { ...formData, [field]: value };
    const result = registrationSchema.safeParse(currentFormData);

    if (result.success) {
      // Clear errors for this field
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      return {};
    } else {
      // Extract errors for this specific field
      const fieldErrors = result.error.issues.filter(
        (issue) => issue.path[0] === field
      );
      const error = fieldErrors.length > 0 ? fieldErrors[0].message : undefined;

      setValidationErrors((prev) => ({ ...prev, [field]: error }));
      return { [field]: error };
    }
  };

  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update password strength when password changes
    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (touchedFields.has(field)) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (
    field: keyof RegistrationFormData,
    value: string
  ) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    validateField(field, value);
  };

  const validateForm = (): boolean => {
    const result = registrationSchema.safeParse(formData);

    if (result.success) {
      setValidationErrors({});
      return true;
    } else {
      // Convert Zod errors to ValidationErrors format
      const errors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ValidationErrors;
        errors[field] = issue.message;
      });
      setValidationErrors(errors);
      return false;
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // First, register the user
      const registerResponse = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.error || "Something went wrong");
        return;
      }

      // Registration successful, now attempt to log in automatically
      setAutoLoginAttempted(true);

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        // Auto-login successful, redirect to dashboard
        setShowSuccessModal(true);
      } else {
        // Auto-login failed, but registration succeeded
        // Show success modal but redirect to login instead
        setShowSuccessModal(true);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const getFieldError = (field: keyof RegistrationFormData) => {
    if (!touchedFields.has(field)) return "";
    return validationErrors[field] || "";
  };

  const isFieldValid = (field: keyof RegistrationFormData) => {
    if (!touchedFields.has(field)) return false;
    return !validationErrors[field] && formData[field] !== "";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#EFE9E3] via-[#F5F0E8] to-[#E1D0B3] flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E1D0B3] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#703B3B] rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-[#8B4F4F] rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="w-full max-w-lg relative z-10 mb-20">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
              <img
                src="/logo.png"
                alt="Batas Kota Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Batas Kota
            </h1>
            <p className="text-gray-600">
              Create your account and start booking soccer fields
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Shield className="w-4 h-4 text-[#703B3B]" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-[#703B3B]" />
              <span>1000+ Players</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-[#703B3B]" />
              <span>Instant Access</span>
            </div>
          </div>

          <Card className="shadow-xl border border-[#E1D0B3]/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-bold">
                  Create Account
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {Math.round(formProgress)}%
                </span>
              </div>
              <Progress value={formProgress} className="h-2" />
              <CardDescription className="text-gray-600">
                Fill in your details to get started with your soccer journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Name field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={(e) => handleFieldBlur("name", e.target.value)}
                      required
                      disabled={isLoading}
                      className={`pl-10 transition-colors ${
                        getFieldError("name")
                          ? "border-red-500 focus:border-red-500"
                          : isFieldValid("name")
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                    />
                    {isFieldValid("name") && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {getFieldError("name") && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {getFieldError("name") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("name")}
                    </p>
                  )}
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      required
                      disabled={isLoading}
                      className={`pl-10 transition-colors ${
                        getFieldError("email")
                          ? "border-red-500 focus:border-red-500"
                          : isFieldValid("email")
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                    />
                    {isFieldValid("email") && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {getFieldError("email") && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {getFieldError("email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>

                {/* Phone field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+62 812-3456-7890"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                      required
                      disabled={isLoading}
                      className={`pl-10 transition-colors ${
                        getFieldError("phone")
                          ? "border-red-500 focus:border-red-500"
                          : isFieldValid("phone")
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                    />
                    {isFieldValid("phone") && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {getFieldError("phone") && (
                      <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {getFieldError("phone") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("phone")}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onBlur={(e) =>
                        handleFieldBlur("password", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      minLength={6}
                      className={`pl-10 pr-12 transition-colors ${
                        getFieldError("password")
                          ? "border-red-500 focus:border-red-500"
                          : isFieldValid("password")
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {isFieldValid("password") && !getFieldError("password") && (
                      <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {getFieldError("password") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("password")}
                    </p>
                  )}

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          Password strength
                        </span>
                        <span className="text-xs text-gray-600">
                          {passwordStrength.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        ></div>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-gray-600 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <div key={index}>• {feedback}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      onBlur={(e) =>
                        handleFieldBlur("confirmPassword", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      minLength={6}
                      className={`pl-10 pr-12 transition-colors ${
                        getFieldError("confirmPassword")
                          ? "border-red-500 focus:border-red-500"
                          : isFieldValid("confirmPassword")
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {isFieldValid("confirmPassword") &&
                      !getFieldError("confirmPassword") && (
                        <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                  </div>
                  {getFieldError("confirmPassword") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("confirmPassword")}
                    </p>
                  )}
                </div>

                {/* Global error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#703B3B] to-[#8B4F4F] hover:from-[#5a2f2f] hover:to-[#7A3F3F] text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading || formProgress < 100}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {autoLoginAttempted
                        ? "Creating account and logging in..."
                        : "Creating account..."}
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#703B3B] hover:text-[#5a2f2f] font-medium underline-offset-4 hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>By creating an account, you agree to our</p>
                  <div className="flex justify-center gap-2">
                    <Link
                      href="/terms"
                      className="text-[#703B3B] hover:text-[#5a2f2f] underline"
                    >
                      Terms of Service
                    </Link>
                    <span>and</span>
                    <Link
                      href="/privacy"
                      className="text-[#703B3B] hover:text-[#5a2f2f] underline"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/dashboard");
        }}
        title="Welcome to Batas Kota! 🎉"
        message="Your account has been created successfully and you're now logged in. Let's start booking soccer fields!"
        buttonText="Go to Dashboard"
      />
    </>
  );
}
