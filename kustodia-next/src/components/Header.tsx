import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  className?: string;
  isAuthenticated: boolean;
  userName?: string;
}

export default function Header({ className = "", isAuthenticated, userName }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-30 bg-white shadow-sm px-4 sm:px-8 py-3 flex items-center justify-between border-b border-black ${className}`}>
      <div className="font-bold text-xl tracking-tight text-blue-700 flex items-center gap-2">
        <Link href="/">
  <Image src="/kustodia-logo.png" alt="Kustodia Logo" width={40} height={40} className="h-10 w-10 mr-2 cursor-pointer" priority />
</Link>
        <span>Kustodia</span>
      </div>
      <nav className="flex items-center gap-3 sm:gap-6">

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900 hidden sm:inline">{userName || 'Usuario'}</span>
            <button className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold hover:shadow-md transition" aria-label="Menú usuario">
              {(userName && userName[0]) || 'N'}
            </button>
          </div>
        ) : (
          <></>
        )}
      </nav>
    </header>
  );
}
