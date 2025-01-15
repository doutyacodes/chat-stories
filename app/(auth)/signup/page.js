"use client"
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import jwt from "jsonwebtoken";
import GlobalApi from "../../_services/GlobalApi";
import Link from 'next/link';


const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const [isMounted, setIsMounted] = useState(false); // Ensure client-side rendering
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
        router.replace("/home");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
      console.error(
        error.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
      <Toaster />
      <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Sign Up</h2>
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
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/" className="text-red-500 hover:underline font-semibold">
            Sign in now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
