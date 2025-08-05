export default function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .hero-title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.2;
          color: white;
          text-align: center;
          margin-bottom: 1rem;
        }
      
      .hero-subtitle {
        font-size: clamp(1rem, 2.5vw, 1.5rem);
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin-bottom: 2rem;
        max-width: 600px;
      }
      
      .cta-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1rem 2rem;
        background: #3b82f6;
        color: white;
        border-radius: 0.5rem;
        font-weight: 600;
        text-decoration: none;
        transition: background-color 0.2s ease;
        min-height: 48px; /* Prevent CLS */
      }
      
      .cta-button:hover {
        background: #2563eb;
      }
      
      /* Prevent layout shift */
      .logo-container {
        width: 200px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .video-container {
        aspect-ratio: 16/9;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }
      
      /* Loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Mobile optimizations */
      @media (max-width: 768px) {
        .hero-section {
          padding: 2rem 1rem;
        }
        
        .hero-title {
          font-size: 2.5rem;
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
        }
        
        .cta-button {
          width: 100%;
          max-width: 300px;
        }
      }
      `
    }} />
  );
}
