"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false); // Ensure client-side rendering
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        router.push("/home"); // Redirect to home page after successful sign up
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("An unexpected error occurred.");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-300 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm text-gray-300 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-green-400">{message}</p>
        )}
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <a
            href="/"
            className="text-red-500 hover:underline font-semibold"
          >
            Sign in now
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
