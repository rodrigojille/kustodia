'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 4.5l9 5.25M4.5 10.5v7.125A1.125 1.125 0 005.625 18.75h12.75A1.125 1.125 0 0019.5 17.625V10.5M8.25 18.75v-3.375a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125V18.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/pagos',
    label: 'Pagos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 10.5v7.125A1.125 1.125 0 005.625 18.75h12.75A1.125 1.125 0 0019.5 17.625V10.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/disputas',
    label: 'Disputas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/webhooks',
    label: 'Webhooks',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m10.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-7.5A2.25 2.25 0 015.25 9m13.5 0h-13.5" />
      </svg>
    ),
  },
  {
    href: '/dashboard/configuracion',
    label: 'Configuración',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/soporte',
    label: 'Soporte',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];


interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed z-50 top-0 left-0 min-h-screen h-full bg-gray-50 text-gray-900 flex flex-col border-r border-gray-200 shadow-sm transition-transform duration-200 transform md:static md:translate-x-0 md:flex md:w-60 ${open ? 'translate-x-0' : '-translate-x-full'} w-64 max-w-full`}
        style={{ minWidth: '16rem' }}
      >
        <div className="flex flex-col items-center py-8">
          <img src="/kustodia-logo.png" alt="Kustodia logo" className="h-10 mb-2" />
          <span className="font-bold text-lg tracking-tight text-blue-700">Kustodia</span>
        </div>
        <nav className="flex-1 px-2">
          {links.slice(0, -2).map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={
                `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 group` +
                (isActive ? ' bg-blue-100 text-blue-700' : ' text-primary-dark')
              }>
                <span className="inline-block w-5 h-5 text-gray-700 opacity-80 group-hover:text-blue-700">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="border-t border-gray-200 my-4"></div>
          {links.slice(-2).map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} className={
                `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 group` +
                (isActive ? ' bg-blue-100 text-blue-700' : ' text-primary-dark')
              }>
                <span className="inline-block w-5 h-5 text-gray-700 opacity-80 group-hover:text-blue-700">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

