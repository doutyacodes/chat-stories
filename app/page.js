'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

const Page = () => {
  useEffect(()=>{
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;    
    if(!token){
      redirect("/login")
    } else {
      redirect("/home")
    }
  },[])
};

export default Page;
