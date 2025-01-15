'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobalApi from "../../_services/GlobalApi";
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const LoginPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Send login request
      const response = await GlobalApi.LoginUser(data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Store token
        toast.success("Logged in successfully!");
        router.replace("/home"); // Redirect to home
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
      <Toaster />
      <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-300 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { required: "Email is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm text-gray-300 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', { required: "Password is required" })}
              className="w-full px-4 py-3 border-none rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Sign In
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-6">
          New to Fictional Chats?{' '}
          <Link href="/signup" className="text-red-500 hover:underline font-semibold">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
