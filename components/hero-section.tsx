"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const [text, setText] = useState("");
  const [loopIndex, setLoopIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const texts = [
    "Buy and Sell Tickets with Ticketer.",
    "Never Miss an Event with Ticketer.",
    "Resell Tickets Easily on Ticketer.",
    "Discover Top Events via Ticketer.",
    "Unforgettable Experiences with Ticketer.",
  ];

  // Typing effect
  useEffect(() => {
    const currentText = texts[loopIndex];
    const typingSpeed = isDeleting ? 20 : 80;

    const handleTyping = () => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setText(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        if (charIndex > 0) {
          setText(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setLoopIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, loopIndex, texts]);

  // Mouse tracking and scroll for parallax
  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const renderText = () => {
    const parts = text.split("Ticketer.");
    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 animate-shimmer">
            Ticketer.
          </span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden text-white bg-gradient-to-br from-blue-900 via-indigo-800 to-cyan-700">
      {/* Enhanced Background Layers */}

      {/* Animated Mesh Gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            conic-gradient(from ${
              Date.now() * 0.01
            }deg at 20% 50%, #1e40af 0deg, #3b82f6 120deg, #06b6d4 240deg, #1e40af 360deg),
            conic-gradient(from ${
              Date.now() * -0.008
            }deg at 80% 30%, #0c4a6e 0deg, #0369a1 90deg, #0891b2 180deg, #0c4a6e 270deg)
          `,
          animation: "mesh-rotate 20s linear infinite",
        }}
      />

      {/* Interactive mouse gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle 400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.4) 0%, rgba(147, 197, 253, 0.2) 40%, transparent 70%)`,
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-float-orb opacity-20"
            style={{
              width: `${100 + i * 20}px`,
              height: `${100 + i * 20}px`,
              left: `${10 + i * 12}%`,
              top: `${10 + i * 8}%`,
              background: `linear-gradient(${
                45 + i * 45
              }deg, #3b82f6, #06b6d4, #8b5cf6)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
              transform: `translateY(${scrollY * 0.1 * (i + 1)}px)`,
            }}
          />
        ))}
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: `translate(${mousePosition.x * 0.02}px, ${
            mousePosition.y * 0.02
          }px)`,
          animation: "grid-shift 15s ease-in-out infinite alternate",
        }}
      />

      {/* Particle System */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: `radial-gradient(circle, ${
                ["#60a5fa", "#34d399", "#a78bfa", "#fb7185"][
                  Math.floor(Math.random() * 4)
                ]
              }, transparent)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Flowing Lines SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M0,200 Q${400 + mousePosition.x * 0.1},${
            150 + mousePosition.y * 0.05
          } 800,250 T1600,200`}
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="2"
          filter="url(#glow)"
          className="animate-flow-1"
        />
        <path
          d={`M0,400 Q${300 + mousePosition.x * 0.08},${
            350 + mousePosition.y * 0.03
          } 600,450 T1200,400`}
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          filter="url(#glow)"
          className="animate-flow-2"
        />
        <path
          d={`M200,0 Q${500 + mousePosition.x * 0.06},${
            200 + mousePosition.y * 0.04
          } 800,100 T1400,50`}
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="1"
          filter="url(#glow)"
          className="animate-flow-3"
        />
      </svg>

      {/* Content */}
      <div
        className="relative z-10 transform transition-all duration-1000"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center leading-tight text-shadow-glow transform hover:scale-105 transition-all duration-700">
          {renderText()}
          <span className="animate-blink text-cyan-300">|</span>
        </h1>

        <div className="flex flex-col gap-4 justify-center items-center animate-fade-in-up-delayed">
          <p className="text-center text-lg sm:text-xl lg:text-2xl max-w-3xl mt-4 mb-4 opacity-90 animate-fade-in-up text-shadow-subtle">
            Discover events near you, resell tickets hassle-free, and never miss
            out again.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 flex items-center gap-2 relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer-button" />
              <Link  href={"/explore"} className="relative z-10">Explore Events</Link>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </button>

            <button className="group border-2 border-cyan-400/60 text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-500 bg-black/20 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/20 transform hover:scale-110 hover:-translate-y-2 w-full sm:w-auto relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Link href={'/register'}>
              <span className="relative z-10">Become an Organizer</span>
              </Link>
            </button>
          </div>
        </div>

        <p className="mt-16 text-sm text-cyan-200/80 text-center animate-pulse-soft">
          Trusted by event organizers worldwide
        </p>
      </div>

      <style jsx>{`
        @keyframes mesh-rotate {
          0% {
            filter: hue-rotate(0deg);
          }
          100% {
            filter: hue-rotate(360deg);
          }
        }

        @keyframes float-orb {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
          }
          66% {
            transform: translateY(-10px) translateX(-15px) scale(0.9);
          }
        }

        @keyframes grid-shift {
          0% {
            transform: translate(0px, 0px);
          }
          100% {
            transform: translate(30px, 30px);
          }
        }

        @keyframes particle {
          0% {
            opacity: 0;
            transform: translateY(0px) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateY(-100px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.5);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes shimmer-button {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes flow-1 {
          0%,
          100% {
            d: path("M0,200 Q400,150 800,250 T1600,200");
          }
          50% {
            d: path("M0,200 Q400,300 800,150 T1600,200");
          }
        }

        @keyframes flow-2 {
          0%,
          100% {
            d: path("M0,400 Q300,350 600,450 T1200,400");
          }
          50% {
            d: path("M0,400 Q300,500 600,350 T1200,400");
          }
        }

        @keyframes flow-3 {
          0%,
          100% {
            d: path("M200,0 Q500,200 800,100 T1400,50");
          }
          50% {
            d: path("M200,0 Q500,50 800,150 T1400,50");
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        .animate-float-orb {
          animation: float-orb ease-in-out infinite;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        .animate-shimmer-button {
          animation: shimmer-button 2s ease-in-out infinite;
        }

        .animate-flow-1 {
          animation: flow-1 8s ease-in-out infinite;
        }

        .animate-flow-2 {
          animation: flow-2 10s ease-in-out infinite reverse;
        }

        .animate-flow-3 {
          animation: flow-3 12s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.5s both;
        }

        .animate-fade-in-up-delayed {
          animation: fade-in-up 1s ease-out 1s both;
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        .animate-pulse-soft {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .text-shadow-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.8),
            0 0 40px rgba(147, 197, 253, 0.6), 0 0 80px rgba(59, 130, 246, 0.4);
        }

        .text-shadow-subtle {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </section>
  );
}
