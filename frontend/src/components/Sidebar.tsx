'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m3.75-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    href: '/dashboard/nuevo-flujo',
    label: 'Pagos condicionales',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
      </svg>
    ),
  },
  {
    href: '/dashboard/web3',
    label: 'Pagos Web3',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    href: '/dashboard/disputas',
    label: 'Disputas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.182 0-4.22-.543-6.082-1.528a14.257 14.257 0 00-3.273-1.528m-3.273 1.528c-1.862.985-3.9 1.528-6.082 1.528a5.988 5.988 0 01-2.036-.243c-.483-.174-.711-.703-.59-1.202L5.25 4.97m0 0c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726c-.122.499.106 1.028.589 1.202a5.988 5.988 0 002.036.243c2.182 0 4.22-.543 6.082-1.528a14.257 14.257 0 013.273-1.528m3.273 1.528c1.862.985 3.9 1.528 6.082 1.528a5.988 5.988 0 002.036.243c.483-.174.711-.703.59-1.202L18.75 4.97M12 4.5v.75m0 15v.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/notificaciones',
    label: 'Notificaciones',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },

  {
    href: '/dashboard/configuracion',
    label: 'Configuración',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.05.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 0 1-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.003-.827c.293-.24.438-.613.438-.995s-.145-.755-.438-.995l-1.003-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.075-.124a6.57 6.57 0 0 1 .22-.127c.332-.183.582.495-.645.87l.213-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/soporte',
    label: 'Soporte',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded: { role: string } = jwtDecode(token);
        setUserRole(decoded.role);
        console.log('[SIDEBAR] User role detected:', decoded.role);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
  }, []);

  const adminLink = {
    href: '/dashboard/admin',
    label: 'Panel Admin',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.474-4.474c-.048-.58-.024-1.193.14-1.743m-2.43 9.928l2.18-2.18m-2.18 2.18l-2.18-2.18" />
      </svg>
    ),
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-white bg-opacity-80 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
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
          {userRole === 'admin' && (
            <Link key={adminLink.href} href={adminLink.href} className={
              `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 group` +
              (pathname.startsWith(adminLink.href) ? ' bg-blue-100 text-blue-700' : ' text-primary-dark')
            }>
              <span className="inline-block w-5 h-5 text-gray-700 opacity-80 group-hover:text-blue-700">{adminLink.icon}</span>
              <span>{adminLink.label}</span>
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}

