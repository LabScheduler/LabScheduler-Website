"use client";

import Image from "next/image";

export default function NotFound() {
  return (
    <div className="w-full h-full flex-1 relative ">
      <Image
        src="/404.png"
        alt="404 Not Found"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}