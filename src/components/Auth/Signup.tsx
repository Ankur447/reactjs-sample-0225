"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully!");
      // You might want to redirect or perform additional actions here
    } catch (err) {
      if (err instanceof FirebaseError) {
        console.error("Firebase signup error:", err.code, err.message);
        setError(getUserFriendlyError(err.code));
      } else {
        console.error("Unknown error:", err);
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccess("Signed up with Google successfully!");
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getUserFriendlyError(err.code));
      } else {
        setError("Google signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserFriendlyError = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email already in use. Please login instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      default:
        return "Signup failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="my-4 flex items-center justify-center">
            <span className="text-gray-500 text-sm">OR</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex gap-2 items-center justify-center"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?
          <Link href="/" className="text-blue-500 ml-1 hover:underline">Login</Link>
        </CardFooter>
      </Card>
    </div>
  );
}