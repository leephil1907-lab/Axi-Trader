"use client";

import { useEffect } from "react";

export default function HelpPage() {
  useEffect(() => {
    window.location.href = "/helpcenter/";
  }, []);
  return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#D31C2B] border-t-transparent rounded-full animate-spin" /></div>;
}
