import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCube, FaArrowRight, FaTerminal, FaShieldHalved, FaVolumeHigh, FaVolumeXmark, FaDownload } from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // keep execution order
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

export default function LandingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [preloaderDone, setPreloaderDone] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) setShowScrollTop(true);
            else setShowScrollTop(false);

            // ScrollSpy Logic - Viewport relative approach
            const sections = ['home', 'feature', 'process'];
            let currentSection = 'home';

            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // If the section's top has crossed the middle of the screen
                    if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
                        currentSection = section;
                    }
                }
            }

            // Guarantee the last section is highlighted if we hit the absolute bottom of the page
            // Using Math.ceil to account for fractional scroll values on high-DPI displays
            if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
                currentSection = 'process';
            }

            setActiveSection(currentSection);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            setIsMenuOpen(false); // Close mobile menu if open
            window.scrollTo({
                top: target.offsetTop - 80, // 80px offset for the fixed navbar
                behavior: 'smooth'
            });
        }
    };

    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);

    // Preloader progress
    useEffect(() => {
        if (!loading && data) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) { clearInterval(interval); setTimeout(() => setPreloaderDone(true), 600); return 100; }
                    return prev + Math.random() * 15 + 5;
                });
            }, 120);
            return () => clearInterval(interval);
        }
    }, [loading, data]);

    useEffect(() => {
        document.title = "Nexus";

        // Mock legacy jQuery plugins to prevent crashes
        window.$ = window.jQuery = {
            fn: {
                metisMenu: function () { return this; },
                magnificPopup: function () { return this; },
                marquee: function () { return this; },
                owlCarousel: function () { return this; },
                slick: function () { return this; }
            }
        };

        // 1. Fetch JSON Data
        const saved = localStorage.getItem('nexus-cms-landing');
        if (saved) {
            setData(JSON.parse(saved));
            setLoading(false);
        } else {
            fetch('/pages/landing.json')
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(json => {
                    setData(json);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load landing data:", err);
                    // Set some fallback data so it doesn't crash
                    setData({ sections: [] });
                    setLoading(false);
                });
        }

        // 2. Load Helax CSS dynamically to prevent global bleed
        const cssFiles = [
            '/helax-assets/css/bootstrap.min.css',
            '/helax-assets/css/fontawesome.css',
            '/helax-assets/css/animate.css',
            '/helax-assets/css/swiper.min.css',
            '/helax-assets/css/magnific-popup.css',
            '/helax-assets/css/main.css'
        ];

        const links = cssFiles.map(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.className = 'helax-dynamic-style';
            document.head.appendChild(link);
            return link;
        });

        // Cleanup CSS on unmount
        return () => {
            links.forEach(link => {
                if (document.head.contains(link)) document.head.removeChild(link);
            });
            document.body.classList.remove('home-dark');
            document.querySelectorAll('script[src^="/helax-assets/"]').forEach(s => s.remove());
        };
    }, []);

    // Force pure dark theme and typography colors to override Helax's light mode defaults
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .body_wrap { background: transparent !important; color: #e2e8f0 !important; overflow-x: hidden; width: 100%; position: relative; }
      
      /* Sleek Cyber Grid Background */
      .cyber-grid {
        position: fixed; width: 100%; height: 100vh; top: 0; left: 0; z-index: -2;
        background-color: #020008;
        background-image: 
          linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
        background-size: 50px 50px;
        pointer-events: none;
      }
      .cyber-grid::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 50%, transparent 0%, #020008 85%);
      }

      .floating-shape { position: absolute; z-index: -1; opacity: 0.15; filter: blur(0.5px); pointer-events: none; }
      
      /* Fix Header visibility and buggy JS sticky behavior */
      /* Premium Floating Navbar */
      /* Total Header Refactor — Eliminating conflicts and double-borders */
      .site-header { 
        background: transparent !important; 
        border: none !important; 
        box-shadow: none !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 9999 !important;
        height: auto !important;
        padding: 0 !important;
      }
      
      .header__main-wrap {
        margin: 15px auto !important;
        width: 94% !important;
        max-width: 1350px !important;
        height: 66px !important;
        background: rgba(10, 15, 30, 0.8) !important; 
        backdrop-filter: blur(25px) saturate(200%) !important; 
        -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
        border: 1px solid rgba(56, 189, 248, 0.25) !important; 
        border-radius: 18px !important;
        box-shadow: 0 15px 35px rgba(0,0,0,0.5) !important;
        display: block !important;
        transition: all 0.4s ease !important;
        overflow: visible !important;
      }
      
      .site-header .container { 
        max-width: 100% !important; 
        padding: 0 25px !important; 
        height: 100% !important;
        display: block !important;
      }
      
      .header__main { 
        width: 100% !important; 
        display: flex !important; 
        align-items: center !important; 
        justify-content: space-between !important; 
        height: 100% !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .main-menu__wrap, .main-menu { 
        position: relative !important; 
        flex: 1 !important; 
        display: flex !important; 
        justify-content: center !important; 
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .header__button { position: relative !important; flex-shrink: 0 !important; }

      .header__logo img { 
        height: 32px !important; 
        width: auto !important; 
        max-width: 140px !important; 
        object-fit: contain !important; 
        display: block !important;
        flex-shrink: 0 !important;
      }
      
      @media (max-width: 991px) {
        .header__main-wrap { margin: 12px auto !important; width: 96% !important; height: 60px !important; border-radius: 14px !important; }
        .site-header .container { padding: 0 18px !important; }
        .header__logo img { height: 26px !important; }
        .main-menu { display: none !important; visibility: hidden !important; opacity: 0 !important; }
        .header__bar { margin: 0 !important; display: flex !important; align-items: center !important; height: 100% !important; transform: scale(0.95); }
      }
      
      /* Fix Hero Flexbox centering overflow bug */
      .hero-style-two {
        display: flex !important;
        align-items: center !important;
        height: auto !important;
        min-height: calc(100vh - 80px) !important;
        background: transparent !important;
        padding-top: 100px !important;
        padding-bottom: 60px !important;
      }
      
      /* Premium Navbar Links */
      .main-menu ul { display: flex !important; gap: 15px !important; margin: 0 !important; padding: 0 !important; align-items: center !important; list-style: none !important; }
      .main-menu ul li a {
        font-family: 'Inter', sans-serif !important;
        font-weight: 700 !important;
        font-size: 0.8rem !important;
        text-transform: uppercase !important;
        letter-spacing: 2px !important;
        color: #94a3b8 !important;
        padding: 8px 16px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        position: relative !important;
        border-radius: 8px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .main-menu ul li a:hover, .main-menu ul li.active a {
        color: #38bdf8 !important;
        background: rgba(56, 189, 248, 0.08) !important;
        text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
      }
      .main-menu ul li a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 0;
        height: 2px;
        background: #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
      }
      .main-menu ul li a:hover::after, .main-menu ul li.active a::after {
        width: 50%;
        opacity: 1;
      }
      
      .hero__content .title { font-size: 3.8rem !important; line-height: 1.1 !important; letter-spacing: -1.5px; text-shadow: 0 0 50px rgba(56, 189, 248, 0.3); font-weight: 900 !important; }
      @media (max-width: 1200px) { .hero__content .title { font-size: 3.2rem !important; } }
      @media (max-width: 991px) { .hero__content .title { font-size: 2.8rem !important; } }
      .hero__content p { font-size: 1.1rem !important; color: #cbd5e1 !important; max-width: 100%; line-height: 1.8 !important; }
      h1, h2, h3, h4, h5, h6 { color: #f8fafc !important; font-weight: 800 !important; }
      p { color: #94a3b8 !important; }
      
      .glass-panel { 
        background: rgba(10, 15, 30, 0.4) !important; 
        backdrop-filter: blur(12px); 
        border: 1px solid rgba(56, 189, 248, 0.1) !important; 
        border-radius: 28px !important; 
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important; 
        overflow: hidden; 
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      }
      .glass-panel:hover { 
        border-color: rgba(56, 189, 248, 0.4) !important; 
        box-shadow: 0 25px 60px -12px rgba(56, 189, 248, 0.15) !important; 
        transform: translateY(-8px) scale(1.01); 
        background: rgba(10, 15, 30, 0.6) !important;
      }
      
      .glow-border {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), transparent, rgba(129, 140, 248, 0.3));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0.5;
        transition: opacity 0.5s ease;
      }
      .glass-panel:hover .glow-border { opacity: 1; }
      
      .crm-feature__item { background: rgba(10, 15, 30, 0.6) !important; backdrop-filter: blur(12px); border: 1px solid rgba(56, 189, 248, 0.1) !important; border-radius: 20px; padding: 40px 30px !important; box-shadow: none !important; transition: all 0.4s ease !important; position: relative; overflow: hidden; }
      .crm-feature__item::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.1), transparent); transition: 0.5s; }
      .crm-feature__item:hover::before { left: 100%; }
      .crm-feature__item:hover { transform: translateY(-10px); border-color: rgba(56, 189, 248, 0.4) !important; box-shadow: 0 20px 40px -10px rgba(56, 189, 248, 0.1) !important; }
      
      .process__app-item, .process__ss { border-radius: 24px; overflow: hidden; }
      .process__app-item img, .process__ss img, .image img { transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); width: 100%; height: auto; display: block; border-radius: 20px; }
      .process__app-item:hover img, .process__ss:hover img, .image:hover img { transform: scale(1.03); }
      .main-menu ul li { margin: 0 8px; }
      .main-menu ul li.active a { color: #38bdf8 !important; }
      .main-menu ul li.active a::after { width: 100%; }

      /* Scroll to Top Button */
      .xb-feature { padding-top: 60px !important; padding-bottom: 60px !important; }
      section { padding-top: 80px !important; padding-bottom: 80px !important; }
      .pt-100 { padding-top: 60px !important; }
      
      /* Ensure the page ends cleanly */
      .site-footer {
        padding: 40px 0 30px;
        border-top: 1px solid rgba(56, 189, 248, 0.1);
        background: #020008;
        text-align: center;
        position: relative;
        z-index: 10;
      }

      .body_wrap { overflow: hidden; min-height: 100vh; }
      .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: rgba(56, 189, 248, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .scroll-to-top:hover {
        background: #38bdf8;
        color: #020008;
        transform: translateY(-8px) scale(1.05);
        box-shadow: 0 15px 45px rgba(56, 189, 248, 0.4);
        border-color: #38bdf8;
      }
      @media (max-width: 768px) {
        .scroll-to-top { bottom: 20px; right: 20px; width: 45px; height: 45px; }
      }
      .main-menu ul li.active a::after { width: 100%; }      
      .thm-btn--gradient { background: linear-gradient(135deg, #38bdf8, #818cf8) !important; color: #fff !important; border: none !important; border-radius: 12px !important; padding: 12px 28px !important; font-weight: 700 !important; letter-spacing: 0.5px; font-size: 0.9rem !important; box-shadow: 0 8px 25px -5px rgba(56, 189, 248, 0.4) !important; transition: all 0.3s ease !important; }
      .thm-btn--gradient:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -5px rgba(56, 189, 248, 0.6) !important; }
      .thm-btn--outline { border: 2px solid rgba(56,189,248,0.3) !important; color: #f8fafc !important; border-radius: 12px !important; padding: 10px 24px !important; font-weight: 600 !important; font-size: 0.9rem !important; backdrop-filter: blur(5px); transition: all 0.3s ease !important; background: transparent !important; }
      .thm-btn--outline:hover { border-color: #38bdf8 !important; background: rgba(56, 189, 248, 0.08) !important; color: #38bdf8 !important; transform: translateY(-2px); }
      
      @media (max-width: 768px) {
        .hero-style-two { padding-top: 100px !important; padding-bottom: 40px !important; }
        .hero__content .title { font-size: 2.2rem !important; }
        .hero__content p { font-size: 0.95rem !important; }
        .glass-panel { border-radius: 16px !important; padding: 20px !important; }
        .crm-feature__item { padding: 25px 20px !important; }
        .thm-btn--gradient, .thm-btn--outline { padding: 10px 18px !important; font-size: 0.8rem !important; }
        .floating-video-container { max-width: 280px !important; margin: 20px auto 0 !important; }
      }
      
      /* Mobile Menu Styles */
      .mobile-menu-overlay { position: fixed; inset: 0; background: rgba(2, 0, 8, 0.98); z-index: 100000; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
      .mobile-menu-links { list-style: none; padding: 0; margin: 0; text-align: center; width: 100%; }
      .mobile-menu-links li { margin-bottom: 25px; width: 100%; }
      .mobile-menu-links a { font-size: 1.5rem; font-weight: 800; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; display: block; padding: 10px; transition: all 0.3s ease; }
      .mobile-menu-links a:hover { color: #38bdf8; text-shadow: 0 0 15px rgba(56,189,248,0.5); }
      .close-menu { position: absolute; top: 30px; right: 30px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
      .close-menu:hover { background: rgba(56,189,248,0.1); border-color: #38bdf8; color: #38bdf8; }
      
      .text-gradient { background: linear-gradient(to right, #38bdf8, #c084fc, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% auto; animation: shine 4s linear infinite; }
      @keyframes shine { to { background-position: 200% center; } }
      
      /* Animated Background Blobs */
      .ambient-blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.3; pointer-events: none; z-index: -1; animation: floatBlob 20s infinite alternate ease-in-out; }
      .blob-1 { width: 60vw; height: 60vw; background: #38bdf8; top: -20%; left: -10%; }
      .blob-2 { width: 50vw; height: 50vw; background: #818cf8; top: 30%; right: -20%; animation-delay: -5s; }
      .blob-3 { width: 40vw; height: 40vw; background: #c084fc; bottom: -10%; left: 10%; animation-delay: -10s; }
      
      @keyframes floatBlob {
        0% { transform: translate(0, 0) scale(1) rotate(0deg); }
        50% { transform: translate(5vw, 5vw) scale(1.2) rotate(180deg); }
        100% { transform: translate(-5vw, 10vw) scale(0.9) rotate(360deg); }
      }
      .floating-video-container { animation: floatVideo 8s infinite ease-in-out; position: relative; z-index: 2; perspective: 1000px; }
      .floating-video-container video { transform: rotateY(-15deg) rotateX(5deg); transition: transform 0.5s ease; }
      .floating-video-container:hover video { transform: rotateY(0deg) rotateX(0deg); }
      
      @keyframes floatVideo {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
      }
      
      /* Premium Download Sidebar Styling */
      .sidebar-download-wrapper { margin-bottom: 30px; }
      .download-btn-premium { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; text-decoration: none; transition: 0.3s; }
      .download-btn-premium:hover { background: rgba(56, 189, 248, 0.1); transform: translateY(-2px); }
      .download-icon-box { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: #38bdf8; color: #020008; border-radius: 10px; font-size: 1.2rem; }
      .download-text { display: flex; flex-direction: column; }
      .download-label { font-size: 0.7rem; letter-spacing: 1px; color: #94a3b8; font-weight: 700; }
      .download-version { font-size: 0.9rem; color: #f8fafc; font-weight: 800; }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        if (!data) return;

        // Load Helax JS dynamically sequentially AFTER DOM is ready
        const jsFiles = [
            '/helax-assets/js/jquery-3.5.1.min.js',
            '/helax-assets/js/bootstrap.bundle.min.js',
            '/helax-assets/js/swiper.min.js',
            '/helax-assets/js/wow.min.js',
            '/helax-assets/js/appear.js',
            '/helax-assets/js/cursor.js',
            '/helax-assets/js/parallax-scroll.js',
            '/helax-assets/js/main.js'
        ];

        const loadScripts = async () => {
            // Add a hidden dummy progress-wrap to prevent main.js crash when it looks for getTotalLength
            if (!document.querySelector('.progress-wrap path')) {
                const dummyProgress = document.createElement('div');
                dummyProgress.className = 'progress-wrap';
                dummyProgress.style.display = 'none';
                dummyProgress.innerHTML = `<svg><path d="M0,0 L1,1"></path></svg>`;
                document.body.appendChild(dummyProgress);
            }

            // Patch jQuery to prevent crashes from missing plugins in main.js
            if (window.jQuery) {
                window.jQuery.fn.metisMenu = function () { return this; };
                window.jQuery.fn.marquee = function () { return this; };
                window.jQuery.fn.magnificPopup = function () { return this; };
                window.jQuery.fn.owlCarousel = function () { return this; };
                window.jQuery.fn.slick = function () { return this; };
            }

            for (const src of jsFiles) {
                try {
                    await loadScript(src);
                    // Re-patch after jQuery loads just in case it was overwritten
                    if (window.jQuery) {
                        window.jQuery.fn.metisMenu = window.jQuery.fn.metisMenu || function () { return this; };
                        window.jQuery.fn.marquee = window.jQuery.fn.marquee || function () { return this; };
                        window.jQuery.fn.magnificPopup = window.jQuery.fn.magnificPopup || function () { return this; };
                        window.jQuery.fn.owlCarousel = window.jQuery.fn.owlCarousel || function () { return this; };
                        window.jQuery.fn.slick = window.jQuery.fn.slick || function () { return this; };
                    }
                } catch (e) {
                    console.error('Failed to load', src);
                }
            }
        };

        // Slight delay to ensure React commits the DOM
        setTimeout(loadScripts, 100);

    }, [data]);

    // Preloader Screen
    if (!preloaderDone) {
        return (
            <AnimatePresence>
                <motion.div
                    key="preloader"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#020008', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}
                >
                    <motion.img
                        src="/assets/images/logo.png"
                        alt="NEXUS"
                        style={{ height: 80, filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.6))' }}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.h1
                        style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: 12, color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >NEXUS</motion.h1>
                    <div style={{ width: 280, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: 4, width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', letterSpacing: 4, fontFamily: 'monospace' }}>{Math.min(Math.round(progress), 100)}%</span>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (loading || !data) return null;

    const hero = data.sections.find(s => s.type === 'hero-premium');
    const features = data.sections.find(s => s.type === 'features-6-grid');
    const showcase1 = data.sections.find(s => s.type === 'split-horizontal');
    const showcase2 = data.sections.find(s => s.type === 'split-vertical-video');
    const showcase3 = data.sections.find(s => s.type === 'split-grid-bottom');
    const testimonials = data.sections.find(s => s.type === 'testimonials');
    const footerCta = data.sections.find(s => s.type === 'footer-cta');

    return (
        <div className="body_wrap" style={{ position: 'relative' }}>
            <div className="cyber-grid"></div>

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.div
                        className="scroll-to-top"
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.5 }}
                        onClick={scrollToTop}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiIcons.FiArrowUp size={24} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Animated Blobs & Shapes */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="floating-shape"
                    style={{
                        left: `${(i * 10) + Math.random() * 5}%`,
                        top: `${(i * 8) + Math.random() * 10}%`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 30, 0],
                        rotate: [0, 180, 360],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{
                        duration: 20 + (i * 3),
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {i % 3 === 0 ? <FaCube size={25 + i * 4} color="#38bdf8" /> :
                        i % 3 === 1 ? <FaTerminal size={20 + i * 4} color="#818cf8" /> :
                            <FaShieldHalved size={22 + i * 4} color="#c084fc" />}
                </motion.div>
            ))}

            <div className="ambient-blob blob-1"></div>
            <div className="ambient-blob blob-2"></div>
            <div className="ambient-blob blob-3"></div>

            {/* Custom Cursor from Helax */}
            <div className="xb-cursor tx-js-cursor style-2">
                <div className="xb-cursor-wrapper">
                    <div className="xb-cursor--follower xb-js-follower"></div>
                </div>
            </div>

            {/* header start */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="site-header header-style-two"
            >
                <div className="header__main-wrap">
                    <div className="container">
                        <div className="header__main ul_li_between">
                            <div className="header__logo">
                                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                                    <img src="/assets/images/logo.png" className="nav-logo-img" alt="Nexus" style={{ filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.5))' }} />
                                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', letterSpacing: 3, fontFamily: 'Inter, sans-serif' }}>NEXUS</span>
                                </Link>
                            </div>
                            <div className="main-menu__wrap ul_li navbar navbar-expand-lg">
                                <nav className="main-menu collapse navbar-collapse">
                                    <ul>
                                        {data?.navbar?.filter(link => link.type !== 'link').map((link, idx) => (
                                          <li key={idx} className={activeSection === link.href.replace('#', '') ? 'active' : ''}>
                                            <a href={link.href} onClick={(e) => handleSmoothScroll(e, link.href.replace('#', ''))}>{link.label}</a>
                                          </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                            <div className="d-lg-none">
                                <button
                                    className="header__bar hamburger_menu"
                                    style={{ background: 'none', border: 'none', padding: 0 }}
                                    onClick={() => setIsMenuOpen(true)}
                                >
                                    <div className="header__bar-icon"><span></span><span></span><span></span></div>
                                </button>
                            </div>
                            <div className="header__button d-none d-lg-flex gap-3 align-items-center">
                                <a className="thm-btn thm-btn--outline style-2 d-flex align-items-center gap-2" href="https://drive.google.com/file/d/1l8dl3KJtxv0mDZkKILKpa6b9pkEYJEV7/view?usp=sharing" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', fontSize: '0.85rem' }}><FaDownload size={14} /> Download</a>
                                <Link className="thm-btn thm-btn--gradient style-2" to="/docs/getting-started" target="_blank" rel="noreferrer" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>Documentation</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>
            {/* header end */}

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="mobile-menu-overlay"
                    >
                        <div className="sidebar-nav">
                            {/* Premium Download Button - Moved to Top */}
                            <div className="sidebar-download-wrapper">
                                <a
                                    href="https://drive.google.com/file/d/19ZGXVUwLJnPlwk9FzTxDWMnc78GTN-6J/view"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="download-btn-premium"
                                >
                                    <div className="download-icon-box">
                                        <FaDownload />
                                    </div>
                                    <div className="download-text">
                                        <span className="download-label">LATEST STABLE</span>
                                        <span className="download-version">Download v2.2 (.exe)</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <button className="close-menu" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '2.5rem' }}>&times;</button>
                        <ul className="mobile-menu-links">
                            {data?.navbar?.map((link, idx) => (
                              <li key={idx}>
                                {link.type === 'link' ? (
                                  <Link to={link.href} onClick={() => setIsMenuOpen(false)}>{link.label}</Link>
                                ) : (
                                  <a href={link.href} onClick={(e) => handleSmoothScroll(e, link.href.replace('#', ''))}>{link.label}</a>
                                )}
                              </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                {/* hero start */}
                {hero && (
                    <section id="home" className="hero hero-style-two pos-rel" style={{ background: 'transparent' }}>
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6">
                                    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hero__content style-3 text-start">
                                        <div className="mb-4 d-inline-block px-4 py-2 rounded-pill" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>
                                            <FaShieldHalved className="me-2" /> {hero.badge || 'V2.2 Firmware'}
                                        </div>
                                        <h1 className="title mb-4" style={{ fontSize: 'clamp(1.8rem, 6vw, 3.8rem)', lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: hero.heading }}></h1>
                                        <p className="mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 520, color: 'rgba(248,250,252,0.8)' }} dangerouslySetInnerHTML={{ __html: hero.content }}></p>
                                        <div className="d-flex gap-2 flex-wrap mb-3">
                                            <Link className="thm-btn thm-btn--gradient style-2 d-flex align-items-center gap-2" to="/docs/getting-started">{hero.primaryBtn} <FaArrowRight /></Link>
                                            <a className="thm-btn thm-btn--outline style-2 d-flex align-items-center gap-2" href="#process" onClick={(e) => handleSmoothScroll(e, 'process')}><FaTerminal /> {hero.secondaryBtn}</a>
                                        </div>
                                        {/* Stats */}
                                        <div className="d-flex gap-3 flex-wrap mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            {[{ v: '60+', l: 'FPS Inference' }, { v: '<2ms', l: 'Latency' }, { v: '8', l: 'Modules' }, { v: '100%', l: 'Open Source' }].map((s, i) => (
                                                <div key={i} style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 12, padding: '15px 10px', textAlign: 'center', flex: '1 1 calc(45% - 1rem)', minWidth: 120 }}>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>{s.v}</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>{s.l}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="col-lg-6 mt-5 mt-lg-0">
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {hero.heroVideo ? (
                                            <div className="floating-video-container" style={{ position: 'relative', width: '100%', maxWidth: '360px', marginLeft: 'auto', aspectRatio: '9/16' }}>
                                                <div style={{ position: 'absolute', top: -30, left: -30, right: -30, bottom: -30, background: 'linear-gradient(135deg, #38bdf8, #818cf8)', filter: 'blur(60px)', opacity: 0.3, zIndex: -1, borderRadius: '32px' }}></div>
                                                <video ref={videoRef} src={hero.heroVideo} autoPlay loop muted={isMuted} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }} />
                                                <button onClick={() => { setIsMuted(!isMuted); if (videoRef.current) videoRef.current.muted = !isMuted; }} style={{ position: 'absolute', bottom: 15, right: 15, width: 40, height: 40, borderRadius: '50%', background: 'rgba(3,0,20,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(56,189,248,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                                                    {isMuted ? <FaVolumeXmark size={14} /> : <FaVolumeHigh size={14} />}
                                                </button>
                                            </div>
                                        ) : (
                                            <img src={hero.heroImage} alt="Hero" style={{ width: '100%', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)' }} />
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* feature start */}
                {features && (
                    <section id="feature" className="crm-feature pos-rel pt-120 pb-140">
                        <div className="container">
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="crm-feature__title text-center mb-60">
                                <h2 style={{ fontSize: '2.5rem' }}>{features.heading}</h2>
                            </motion.div>
                            <div className="row justify-content-center mt-none-20">
                                {features.items.map((item, idx) => (
                                    <div key={idx} className="col-lg-4 col-md-6 mt-20">
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.15 }}
                                            transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                                            className="crm-feature__item h-100"
                                        >
                                            <div className="icon mb-40">
                                                <img src={`/helax-assets/img/icon/ft_0${(idx % 7) + 1}.svg`} alt="icon" style={{ filter: 'brightness(0) saturate(100%) invert(67%) sepia(50%) saturate(1478%) hue-rotate(170deg) brightness(101%) contrast(97%)' }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{item.title}</h3>
                                            <p style={{ fontSize: '0.9rem' }}>{item.desc}</p>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* process start */}
                <section id="process" className="process pos-rel pb-120 pt-60">
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-60">
                            <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', fontWeight: 600, fontSize: '0.8rem', letterSpacing: 1 }}>ARCHITECTURE</div>
                            <h2 style={{ fontSize: '2.8rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.2 }}>Essential engines that power <span className="text-gradient">your hardware</span></h2>
                        </motion.div>
                        {showcase1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{ duration: 0.7 }}
                                className="glass-panel p-4 p-md-5 mb-5" style={{ position: 'relative' }}
                            >
                                <div className="glow-border"></div>
                                <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>01 — CALIBRATION</div>
                                <div className="row align-items-center">
                                    <div className="col-lg-5 mb-4 mb-lg-0">
                                        <div className="pe-lg-4">
                                            <h3 className="title mb-3" style={{ fontSize: '2.5rem', fontWeight: 900 }}>{showcase1.block.title}</h3>
                                            <p className="mb-4" style={{ fontSize: '1.05rem', color: '#94a3b8' }}>{showcase1.block.desc}</p>
                                            <div className="mt-4">
                                                <Link className="thm-btn thm-btn--gradient style-2 d-inline-flex align-items-center gap-2" to="/docs/getting-started">
                                                    {showcase1.block.btnText} <FaArrowRight />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-7">
                                        <div className="rounded-4 overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)' }}>
                                            <img src={showcase1.block.image} alt="" style={{ width: '100%', display: 'block' }} className="hover-scale" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {showcase2 && (
                            <div className="row g-4 mt-5">
                                <div className="col-lg-5">
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.15 }}
                                        transition={{ duration: 0.6 }}
                                        className="glass-panel p-4 p-md-5 d-flex flex-column align-items-center justify-content-center text-center h-100" style={{ position: 'relative' }}
                                    >
                                        <div className="glow-border"></div>
                                        <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.15)', color: '#c084fc', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>02 — LIVE FEED</div>
                                        <div className="mb-4" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                                            <div style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, background: 'linear-gradient(45deg, #c084fc, #38bdf8)', filter: 'blur(20px)', opacity: 0.2, zIndex: -1, borderRadius: '24px' }}></div>
                                            <video src={showcase2.blocks[0].videoSrc} autoPlay loop muted playsInline style={{ width: '100%', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}></video>
                                        </div>
                                        <div className="mt-2">
                                            <h3 className="title mb-3" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{showcase2.blocks[0].title}</h3>
                                            <p className="mb-0" style={{ color: '#94a3b8' }}>{showcase2.blocks[0].desc}</p>
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="col-lg-7">
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.15 }}
                                        transition={{ duration: 0.6, delay: 0.15 }}
                                        className="glass-panel p-4 p-md-5 d-flex flex-column h-100" style={{ position: 'relative' }}
                                    >
                                        <div className="glow-border"></div>
                                        <div className="d-inline-block px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>03 — LASER MAPPING</div>
                                        <div className="mb-4 text-start">
                                            <h3 className="title mb-3" style={{ fontSize: '2.2rem', fontWeight: 900 }}>{showcase2.blocks[1].title}</h3>
                                            <p className="mb-0" style={{ color: '#94a3b8', fontSize: '1.05rem' }}>{showcase2.blocks[1].desc}</p>
                                        </div>
                                        <div className="rounded-4 overflow-hidden position-relative group shadow-2xl mt-4" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <img src={showcase2.blocks[1].image} alt="" style={{ width: '100%', transition: 'transform 0.5s ease', display: 'block' }} className="hover-scale" />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {showcase3 && (
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.7 }}
                                className="row pt-100"
                            >
                                <div className="col-12">
                                    <div className="glass-panel p-4 p-md-5" style={{ position: 'relative' }}>
                                        <div className="glow-border"></div>
                                        <div className="d-inline-block px-3 py-1 rounded-pill mb-4" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>04 — HARDWARE CONTROL</div>
                                        <div className="row align-items-center">
                                            <div className="col-lg-5 mb-4 mb-lg-0">
                                                <div className="pe-lg-4">
                                                    <h2 className="title mb-3" style={{ fontSize: '2.5rem', fontWeight: 900 }}>{showcase3.topBlock.title}</h2>
                                                    <p className="mb-4" style={{ fontSize: '1.05rem', color: '#94a3b8' }}>{showcase3.topBlock.desc}</p>
                                                    <div className="mt-4">
                                                        <Link className="thm-btn thm-btn--gradient style-2 d-inline-flex align-items-center gap-2" to="/docs/hardware">
                                                            {showcase3.topBlock.btnText} <FaArrowRight />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="rounded-4 overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)' }}>
                                                    <img src={showcase3.topBlock.image} alt="" style={{ width: '100%', display: 'block' }} className="hover-scale" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-4 mt-5">
                                            {showcase3.bottomBlocks.map((bb, idx) => (
                                                <div key={idx} className="col-lg-6">
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 30 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.15 }}
                                                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                                                        className="glass-panel p-4 d-flex flex-column h-100"
                                                        style={{ background: 'rgba(255,255,255,0.03) !important' }}
                                                    >
                                                        <div className="glow-border"></div>
                                                        <div className="mb-4 text-start">
                                                            <h3 className="title mb-2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{bb.title}</h3>
                                                            <p className="mb-0" style={{ color: '#94a3b8' }}>{bb.desc}</p>
                                                        </div>
                                                        <div className="rounded-3 overflow-hidden mt-auto shadow-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <img src={bb.image} alt="" style={{ width: '100%', display: 'block' }} className="hover-scale" />
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>

                <footer className="site-footer">
                    <div className="container">
                        <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                                <img src="/assets/images/logo.png" alt="Nexus" style={{ height: 32, opacity: 0.7 }} />
                                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', letterSpacing: 2 }}>NEXUS</span>
                            </Link>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '400px' }}>
                                Military-grade Edge AI vision and stereo targeting orchestration. Built for precision, performance, and industrial-grade reliability.
                            </div>
                            <div style={{ width: '100px', height: '1px', background: 'rgba(56, 189, 248, 0.15)', margin: '10px 0' }}></div>
                            <p style={{ color: '#475569', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                © 2026 NEXUS GUARDIAN. ALL RIGHTS RESERVED.
                            </p>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}
