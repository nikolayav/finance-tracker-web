import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/auth";
import { saveAuth } from "@/lib/auth";
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
import {
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      saveAuth(data.accessToken, {
        email: data.email,
        displayName: data.displayName,
      });
      navigate("/dashboard");
    },
    onError: () => {
      setError("Invalid email or password.");
    },
  });

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* App icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-7 h-7 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your FinancePlanner account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                  Sign in
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
