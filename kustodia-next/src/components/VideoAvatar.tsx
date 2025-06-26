'use client';
import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VideoAvatarProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  subtitle?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
}

export default function VideoAvatar({
  videoUrl = "/avatar.mp4",
  posterUrl = "/kustodia-logo.png",
  title = "Conoce a tu asesor digital",
  subtitle = "Hola, soy tu guía en Kustodia. Te explico cómo funciona nuestro sistema de pagos seguros.",
  autoPlay = false,
  muted = true,
  className = ""
}: VideoAvatarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      if (!hasPlayed) {
        video.muted = false;
        setIsMuted(false);
        setHasPlayed(true);
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      video.currentTime = 0;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    if (autoPlay) {
      video.muted = true;
      setIsMuted(true);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Autoplay was prevented:", error);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay]);

  return (
    <div className={`relative max-w-md mx-auto ${className}`}>
      {/* Main Video Container */}
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 shadow-2xl border border-blue-200/50 overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-200/30 rounded-full -ml-8 -mb-8" />
        
        {/* Video Container */}
        <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={posterUrl}
            muted={isMuted}
            playsInline
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group"
              onClick={togglePlay}
            >
              <div className="bg-blue-600 hover:bg-blue-700 rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
                <FaPlay className="text-white text-2xl ml-1" />
              </div>
            </div>
          )}

          {/* Video Controls */}
          {showControls && isPlaying && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={togglePlay}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white transition-all duration-200"
              >
                {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white transition-all duration-200"
              >
                {isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
              </button>
            </div>
          )}

          {/* Loading indicator */}
          {isPlaying && (
            <div className="absolute top-4 right-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Content Below Video */}
        <div className="mt-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={togglePlay}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}
            {isPlaying ? 'Pausar' : 'Ver presentación'}
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Asesor verificado
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Kustodia oficial
          </span>
        </div>
      </div>

      {/* Floating notification */}
      {!isPlaying && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
          ¡Nuevo!
        </div>
      )}
    </div>
  );
}
