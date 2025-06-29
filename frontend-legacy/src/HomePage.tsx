import React from 'react';
import { FaUser, FaLock, FaMoneyBillWave } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { FaShieldAlt, FaEye, FaHeadset, FaRocket } from 'react-icons/fa';

const benefits = [
  {
    title: 'Protege tus pagos',
    description: 'Kustodia asegura que tu dinero esté protegido hasta que el servicio o producto sea entregado. Sin riesgos, sin fraudes.',
    icon: <FaShieldAlt size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Escrow inteligente',
    description: 'Utilizamos tecnología de escrow para que el pago se libere solo cuando ambas partes estén satisfechas.',
    icon: <FaLock size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Transparencia total',
    description: 'Seguimiento en tiempo real de cada paso de la transacción. Sin letras pequeñas.',
    icon: <FaEye size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Soporte experto',
    description: 'Nuestro equipo de soporte está disponible para ayudarte en cada paso del proceso.',
    icon: <FaHeadset size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  },
  {
    title: 'Rápido y sencillo',
    description: 'Regístrate, crea tu transacción y disfruta de una experiencia segura en minutos.',
    icon: <FaRocket size={38} color="#1A73E8" style={{ marginBottom: 12 }} />
  }
];

const HomePage: React.FC = () => (
  <div style={{ fontFamily: 'Montserrat, Arial, sans-serif', background: '#F8FAFB', minHeight: '100vh' }}>
    <Helmet>
      <title>Kustodia | La plataforma líder en pagos protegidos mediante blockchain</title>
      <meta name="description" content="Kustodia utiliza tecnología blockchain y el peso digital MXNB para proteger tus pagos. Tu dinero está seguro en custodia y se libera solo si no hay disputas. Innovación y confianza en cada transacción." />
      <meta name="keywords" content="escrow, pagos seguros, blockchain, MXNB, fintech, Kustodia, arbitrum, smart contract" />
      <link rel="canonical" href="https://kustodia.com/" />
    </Helmet>
    <header style={{
      background: '#F8FAFB',
      padding: '32px 0',
      textAlign: 'center',
      color: '#1A73E8',
      marginBottom: 24,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1A73E8 0%, #1976D2 50%, #0B57D0 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(26,115,232,0.12)',
        maxWidth: 420,
        margin: '0 auto',
        padding: '32px 18px 28px 18px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img src="/logo.svg" alt="Kustodia Logo" style={{ width: 64, marginBottom: 10, filter: 'drop-shadow(0 2px 8px #E3EAFD)' }} />
        <h1 style={{
          fontSize: 30,
          margin: '0 0 16px 0',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          textShadow: '0 2px 8px rgba(26,115,232,0.08)',
        }}>
          ¡Paga seguro y sin riesgo!
        </h1>
        <p style={{
          fontSize: 18,
          margin: '0 0 20px 0',
          fontWeight: 500,
          maxWidth: 340,
          color: '#E3EAFD',
          lineHeight: 1.4,
          textShadow: '0 1px 4px rgba(26,115,232,0.10)',
        }}>
          Tú decides cuánto y cuándo se libera tu dinero.<br />
          Sin fraudes, sin sorpresas. Así de fácil.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320, marginTop: 18 }}>
          <a href="/register" style={{
            display: 'block',
            background: '#fff',
            color: '#1A73E8',
            padding: '15px 0',
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 18,
            textDecoration: 'none',
            boxShadow: '0 2px 8px #E3EAFD',
            transition: 'background 0.2s',
            marginBottom: 0,
          }}>Empieza ahora</a>
          <a href="/login" style={{
            display: 'block',
            background: 'none',
            color: '#fff',
            border: '2px solid #fff',
            padding: '15px 0',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            textDecoration: 'none',
            transition: 'background 0.2s, color 0.2s',
          }}>Iniciar sesión</a>
        </div>
      </div>
    </header>
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 16px' }}>
      <h2 style={{ fontSize: 32, color: '#1A73E8', textAlign: 'center', fontWeight: 700 }}>¿Por qué elegir Kustodia?</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 32,
          gap: 16,
        }}
      >
        {benefits.map((b, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px #E3EAFD',
              padding: 32,
              margin: 8,
              flex: '1 1 320px',
              maxWidth: 340,
              minWidth: 220,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <span>{b.icon}</span>
            <h3
              style={{
                color: '#D32F2F',
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                marginTop: 4,
              }}
            >
              {b.title}
            </h3>
            <p
              style={{
                color: '#333',
                fontSize: 15,
                marginTop: 10,
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              {b.description}
            </p>
          </div>
        ))}
      </div>
      <section style={{ marginTop: 36, marginBottom: 0, background: '#fff', borderRadius: 18, boxShadow: '0 2px 8px #E3EAFD', padding: '28px 12px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 23, textAlign: 'center', marginBottom: 10 }}>¿Qué es MXNB?</h2>
        <p style={{ color: '#333', fontSize: 16, textAlign: 'center', maxWidth: 340, margin: '0 auto 12px auto', lineHeight: 1.5 }}>
          <strong>MXNB</strong> es dinero digital que siempre vale lo mismo que un peso mexicano.<br/>
          Puedes enviar, recibir y guardar MXNB de forma rápida y segura usando la tecnología blockchain.
          <br />
          <a href="https://mxnb.mx/es-MX" target="_blank" rel="noopener noreferrer" style={{ color: '#1A73E8', textDecoration: 'underline' }}>Más información sobre MXNB</a>
        </p>
        <div style={{ background: '#F8FAFB', borderRadius: 12, padding: '18px 8px', margin: '20px 0', boxShadow: '0 1px 4px #E3EAFD' }}>
          <h3 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 18, textAlign: 'center', margin: '0 0 10px 0' }}>¿Por qué usamos smart contracts?</h3>
          <ul style={{ color: '#333', fontSize: 15, maxWidth: 320, margin: '0 auto 12px auto', paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Tu dinero queda seguro en custodia.</li>
            <li>Las reglas se cumplen solas, sin personas de por medio.</li>
            <li>No hay trucos ni sorpresas: todo es automático y transparente.</li>
          </ul>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: 24,
              padding: '14px 0',
              background: '#F5F8FE',
              borderRadius: 12,
              maxWidth: 340,
              margin: '0 auto 10px auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
              <FaUser size={32} color="#1A73E8" style={{ marginBottom: 2, display: 'block' }} />
              <span style={{ fontWeight: 700, color: '#1A73E8', fontSize: 15 }}>Tú</span>
            </div>
            <span style={{ fontSize: 26, color: '#1A73E8', margin: '0 2px' }}>→</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 92 }}>
              <FaLock size={32} color="#1A73E8" style={{ marginBottom: 2, display: 'block' }} />
              <span style={{ fontWeight: 700, color: '#1A73E8', fontSize: 15 }}>En custodia</span>
              <span style={{ color: '#1A73E8', fontSize: 11 }}>(Smart Contract)</span>
            </div>
            <span style={{ fontSize: 26, color: '#1A73E8', margin: '0 2px' }}>→</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 92 }}>
              <FaMoneyBillWave size={32} color="#1A73E8" style={{ marginBottom: 2, display: 'block' }} />
              <span style={{ fontWeight: 700, color: '#1A73E8', fontSize: 15 }}>Liberado</span>
            </div>
          </div>
          <style>{`
            @media (max-width: 600px) {
              .payment-flow-diagram {
                flex-direction: column !important;
                gap: 8px !important;
                align-items: center !important;
              }
              .payment-flow-diagram > div {
                min-width: 0 !important;
              }
              .payment-flow-diagram span[style*='font-size: 26px'] {
                transform: rotate(90deg);
                margin: 0;
              }
            }
          `}</style>
          <ol style={{ color: '#333', fontSize: 15, maxWidth: 320, margin: '0 auto', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Envías tu dinero a custodia con MXNB.</li>
            <li>El smart contract lo guarda seguro y aplica las reglas.</li>
            <li>Cuando termina el tiempo de custodia, el dinero se libera automáticamente.</li>
          </ol>
        </div>
      </section>
      <section style={{ marginTop: 64, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #E3EAFD', padding: 32 }}>
        <h2 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 28, textAlign: 'center' }}>¿Cómo funciona Kustodia?</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginTop: 40 }}>
          <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 240, textAlign: 'center', padding: 16 }}>
            <FaUser size={36} color='#1A73E8' style={{ marginBottom: 8 }} />
            <h4 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 18, margin: '8px 0' }}>Crea tu cuenta</h4>
            <p style={{ color: '#333', fontSize: 15, margin: 0 }}>Registra tu cuenta en Kustodia y comienza a disfrutar de pagos seguros y transparentes.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 240, textAlign: 'center', padding: 16 }}>
            <FaRocket size={36} color='#1A73E8' style={{ marginBottom: 8 }} />
            <h4 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 18, margin: '8px 0' }}>Inicia un pago seguro</h4>
            <p style={{ color: '#333', fontSize: 15, margin: 0 }}>Tan sencillo como una transferencia SPEI, pero con la seguridad de blockchain.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 240, textAlign: 'center', padding: 16 }}>
            <FaEye size={36} color='#1A73E8' style={{ marginBottom: 8 }} />
            <h4 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 18, margin: '8px 0' }}>Seguimiento transparente</h4>
            <p style={{ color: '#333', fontSize: 15, margin: 0 }}>Mantén el control de tus pagos en todo momento con nuestro sistema de seguimiento transparente.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 240, textAlign: 'center', padding: 16 }}>
            <FaLock size={36} color='#1A73E8' style={{ marginBottom: 8 }} />
            <h4 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 18, margin: '8px 0' }}>Pago liberado tras custodia</h4>
            <p style={{ color: '#333', fontSize: 15, margin: 0 }}>El dinero se libera solo después del periodo de custodia y si no se presenta ninguna disputa. Máxima tranquilidad para todos.</p>
          </div>
        </div>
      </section>
      <section style={{ marginTop: 64, textAlign: 'center' }}>
        <h2 style={{ color: '#1A73E8', fontWeight: 700, fontSize: 28 }}>Empieza hoy mismo</h2>
        <a href="/register" style={{
          display: 'inline-block',
          marginTop: 24,
          background: '#1A73E8',
          color: '#fff',
          padding: '14px 36px',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 18,
          textDecoration: 'none',
          boxShadow: '0 2px 8px #E3EAFD',
          transition: 'background 0.2s',
        }}>Regístrate gratis</a>
      </section>
    </main>
    <footer style={{ background: '#1A73E8', color: '#fff', textAlign: 'center', padding: 24, marginTop: 48, fontSize: 15 }}>
      <div style={{ marginBottom: 8 }}>
        <a href="/terminos" style={{ color: '#fff', textDecoration: 'underline', marginRight: 16 }}>Términos y Condiciones</a>
        <a href="/privacidad" style={{ color: '#fff', textDecoration: 'underline' }}>Aviso de Privacidad</a>
      </div>
      &copy; {new Date().getFullYear()} Kustodia. Todos los derechos reservados.
    </footer>
  </div>
);

export default HomePage;
