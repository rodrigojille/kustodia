import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full py-8 bg-white text-center text-black text-sm mt-12 md:ml-64 md:pl-12">
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-2">
      <a href="/terminos" className="text-blue-700 underline mr-4">Términos y Condiciones</a>
      <a href="/privacidad" className="text-blue-700 underline">Aviso de Privacidad</a>
    </div>
    <div className="flex justify-center gap-6 mb-4">
      <a href="https://x.com/Kustodia_mx" target="_blank" rel="noopener noreferrer" aria-label="Twitter Kustodia" className="text-blue-400 hover:text-blue-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.46 5.924c-.793.352-1.645.59-2.538.698a4.48 4.48 0 001.962-2.48 8.936 8.936 0 01-2.825 1.08 4.466 4.466 0 00-7.61 4.07A12.675 12.675 0 013.11 4.86a4.465 4.465 0 001.384 5.955 4.444 4.444 0 01-2.025-.56v.057a4.468 4.468 0 003.58 4.377c-.396.108-.812.166-1.24.166-.304 0-.6-.03-.89-.085a4.472 4.472 0 004.17 3.104A8.956 8.956 0 012 19.54a12.633 12.633 0 006.84 2.004c8.207 0 12.7-6.797 12.7-12.7 0-.193-.004-.386-.013-.577a9.08 9.08 0 002.233-2.307z"/></svg>
      </a>
      <a href="https://www.linkedin.com/company/kustodia-mx" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Kustodia" className="text-blue-400 hover:text-blue-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76c.97 0 1.75.79 1.75 1.76s-.78 1.76-1.75 1.76zm13.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59v5.61z"/></svg>
      </a>
      <a href="https://www.instagram.com/kustodia.mx/#" target="_blank" rel="noopener noreferrer" aria-label="Instagram Kustodia" className="text-blue-400 hover:text-blue-700 transition-colors text-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.342 3.608 1.317.975.975 1.255 2.243 1.317 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.342 2.633-1.317 3.608-.975.975-2.243 1.255-3.608 1.317-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.342-3.608-1.317-.975-.975-1.255-2.243-1.317-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.342-2.633 1.317-3.608.975-.975 2.243-1.255 3.608-1.317C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.771.13 4.653.385 3.678 1.36c-.975.975-1.23 2.093-1.288 3.374C2.014 5.668 2 6.077 2 9.333v5.334c0 3.256.014 3.665.072 4.945.058 1.281.313 2.399 1.288 3.374.975.975 2.093 1.23 3.374 1.288 1.28.058 1.689.072 4.945.072s3.665-.014 4.945-.072c1.281-.058 2.399-.313 3.374-1.288.975-.975 1.23-2.093 1.288-3.374.058-1.28.072-1.689.072-4.945s-.014-3.665-.072-4.945c-.058-1.281-.313-2.399-1.288-3.374-.975-.975-2.093-1.23-3.374-1.288C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
      </a>
    </div>
    <div>© {new Date().getFullYear()} Kustodia. Todos los derechos reservados.</div>
  </footer>
);

export default Footer;
