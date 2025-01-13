'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMounted, setIsMounted] = useState(false); // Flag to check if the component is mounted
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Ensure client-side rendering
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Send login data to backend (PHP)
    try {
      const response = await fetch('http://localhost/login_project/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
      });

      // Get the raw response text
      const textResponse = await response.text();

      // Log the raw response to check for issues
      console.log('Raw response:', textResponse);

      // Try parsing the response as JSON
      try {
        const data = JSON.parse(textResponse);

        if (data.status === 'success') {
          localStorage.setItem('isLoggedIn', 'true');
          router.push('/home');
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err);
        alert('Unexpected error. Please try again later.');
      }
    } catch (err) {
      console.error('Error with fetch request:', err);
      alert('Unable to connect to the server. Please try again later.');
    }
  };

  // Ensure nothing is rendered until hydration is complete
  if (!isMounted) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="bg-gray-800 bg-opacity-90 rounded-md shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Sign In</h2>
        <form onSubmit={handleLogin}>
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
