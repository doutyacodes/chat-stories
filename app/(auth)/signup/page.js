"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import jwt from "jsonwebtoken";
import GlobalApi from "../../_services/GlobalApi";
import Link from 'next/link';
import GoogleAuthButton from "@/app/components/GoogleAuthButton";

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [googleAuthData, setGoogleAuthData] = useState(null);
  const [dobModalOpen, setDobModalOpen] = useState(false);
  const [googleDob, setGoogleDob] = useState("");
  const [googleUsername, setGoogleUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          router.push("/home");
        }
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, [router]);

  const onSubmit = async (data) => {
    try {
      const response = await GlobalApi.SignUpUser(data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        window.dispatchEvent(new Event("auth-change")); // Notify auth listeners
        router.replace("/home");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setIsSubmittingGoogle(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google sign-up failed");
      }

      if (data.status === "LOGGED_IN") {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome back!");
        router.replace("/home");
      } else if (data.status === "NEW_USER") {
        setGoogleAuthData({ idToken: credential, profile: data.googleProfile });
        setGoogleUsername(data.googleProfile?.username || "");
        setDobModalOpen(true);
      }
    } catch (err) {
      toast.error(err.message || "Google sign up failed");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleCompleteGoogleSignup = async (e) => {
    e.preventDefault();
    if (!googleDob) {
      toast.error("Please select your date of birth");
      return;
    }

    setIsSubmittingGoogle(true);
    try {
      const res = await fetch("/api/auth/google/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: googleAuthData.idToken,
          username: googleUsername || googleAuthData.profile?.username,
          date_of_birth: googleDob,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete account setup");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Account created successfully!");
        setDobModalOpen(false);
        router.replace("/home");
      }
    } catch (err) {
      toast.error(err.message || "Failed to complete signup");
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black p-4">
      <Toaster />
      <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Sign Up</h2>

        {/* Google Sign-Up Button */}
        <div className="mb-5">
          <GoogleAuthButton
            text="Sign up with Google"
            onSuccess={handleGoogleSuccess}
            onError={(msg) => toast.error(msg)}
            disabled={isSubmittingGoogle}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            or with email
          </span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        {/* Normal Manual Signup Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm text-gray-300 font-medium mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm text-gray-300 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="date_of_birth"
              className="block text-sm text-gray-300 font-medium mb-2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="date_of_birth"
              max={todayStr}
              {...register("date_of_birth", { required: "Date of birth is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm text-gray-300 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-red-500 hover:underline font-semibold">
            Sign in now
          </Link>
        </p>
      </div>

      {/* Date of Birth Modal for First-Time Google Users */}
      {dobModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl text-white">
            <h3 className="text-xl font-bold mb-2 text-center">Complete Your Profile</h3>
            <p className="text-xs text-gray-400 text-center mb-5">
              Please provide your Date of Birth to personalize your reading experience.
            </p>

            <form onSubmit={handleCompleteGoogleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={googleUsername}
                  onChange={(e) => setGoogleUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={googleDob}
                  max={todayStr}
                  onChange={(e) => setGoogleDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDobModalOpen(false)}
                  className="flex-1 py-2.5 rounded bg-gray-700 hover:bg-gray-600 text-xs font-semibold text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGoogle}
                  className="flex-[2] py-2.5 rounded bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors disabled:opacity-60"
                >
                  {isSubmittingGoogle ? "Saving..." : "Complete Setup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
