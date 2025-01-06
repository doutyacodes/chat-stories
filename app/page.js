"use client"
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();

    // Check if the user is logged in when the page loads
    useEffect(() => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        router.push('/login'); // If not logged in, redirect to the login page
      } else {
        redirect('/home');
      }
    }, [router]);
  
}
