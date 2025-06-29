import React from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  summary?: string;
  hashtags?: string;
  className?: string;
}

const shareLinks = (url: string, title: string, summary?: string, hashtags?: string) => ({
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}${hashtags ? `&hashtags=${encodeURIComponent(hashtags)}` : ''}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`,
  linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${summary ? `&summary=${encodeURIComponent(summary)}` : ''}&source=Kustodia`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
});

export default function SocialShare({ url, title, summary, hashtags, className = '' }: SocialShareProps) {
  const links = shareLinks(url, title, summary, hashtags);
  return (
    <div className={`flex gap-4 mt-8 mb-2 items-center justify-center bg-blue-50 rounded-xl p-4 border border-blue-200 ${className}`}>
      <span className="font-bold text-blue-800">Compartir:</span>
      <a
        href={links.twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Twitter"
        className="hover:text-blue-500"
      >
        <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 001.964-2.478 8.972 8.972 0 01-2.828 1.082 4.48 4.48 0 00-7.636 4.088A12.72 12.72 0 013.15 4.61a4.48 4.48 0 001.388 5.976 4.47 4.47 0 01-2.03-.56v.057a4.48 4.48 0 003.59 4.393 4.486 4.486 0 01-2.025.077 4.48 4.48 0 004.184 3.11A8.98 8.98 0 012 19.54a12.72 12.72 0 006.89 2.02c8.26 0 12.785-6.84 12.785-12.77 0-.195-.005-.39-.014-.583A9.18 9.18 0 0024 4.59a8.978 8.978 0 01-2.54.698z"/></svg>
      </a>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className="hover:text-green-500"
      >
        <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.91 11.91 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.98L0 24l6.26-1.64A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.71 0-3.39-.44-4.86-1.28l-.35-.2-3.72.97.99-3.62-.22-.37A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2c2.5 0 4.85.98 6.62 2.75A9.92 9.92 0 0122 12c0 5.52-4.48 10-10 10zm5.06-7.47c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.26-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.13-.42-2.16-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.13-.13.29-.34.44-.51.15-.17.2-.29.3-.48.1-.19.05-.36-.02-.5-.07-.13-.61-1.47-.83-2.01-.22-.54-.44-.47-.61-.48-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.11 4.92 4.24.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.6-.65 1.83-1.29.23-.64.23-1.19.16-1.29-.07-.1-.25-.16-.52-.29z"/></svg>
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
        className="hover:text-blue-700"
      >
        <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20.25h-3v-9h3v9zm-1.5-10.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm15.25 10.25h-3v-4.5c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.17-1.73 2.38v4.57h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.03 0 3.59 2 3.59 4.59v4.72zm0 0"/></svg>
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Facebook"
        className="hover:text-blue-800"
      >
        <svg className="inline w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .733.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.729 0 1.321-.591 1.321-1.324v-21.35c0-.733-.592-1.325-1.325-1.325z"/></svg>
      </a>
    </div>
  );
}
