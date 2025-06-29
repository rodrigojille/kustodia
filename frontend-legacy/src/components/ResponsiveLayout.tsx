import React, { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

/**
 * ResponsiveLayout provides a mobile-first, centered, sustainable layout for all screens.
 * - Mobile: max-width 375px, centered, padding
 * - Desktop: content centered, background fills viewport, subtle shadow and border-radius
 */
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => (
  <div
    style={{
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F7F9FB',
      fontFamily: 'Montserrat, Arial, sans-serif',
      padding: '0 16px', // Padding horizontal para evitar que el card quede pegado al borde en mobile
      boxSizing: 'border-box',
      position: 'relative',
    }}
  >
    <div
      style={{

        width: '100%',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px #E3EAFD',
        padding: 32,
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {children}
      <footer style={{ textAlign: 'center', fontSize: 13, color: '#888', fontFamily: 'Montserrat, Arial, sans-serif', marginTop: 32, paddingBottom: 18 }}>
  © 2025 Tecnologias Avanzadas Centrales SAPI de CV. Todos los derechos reservados.<br />
  <span>
    <a href="/terminos" style={{ color: '#1A73E8', textDecoration: 'none', marginRight: 8 }}>Términos y condiciones</a>
    |
    <a href="/privacidad" style={{ color: '#1A73E8', textDecoration: 'none', marginLeft: 8 }}>Aviso de privacidad</a>
  </span>
</footer>
    </div>
  </div>
);

export default ResponsiveLayout;
