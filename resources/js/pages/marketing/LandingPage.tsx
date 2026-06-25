import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
  Layers, Cpu, Terminal, Users, QrCode, BarChart3, Shield, 
  ArrowRight, CheckCircle, Database, BrainCircuit, Fingerprint, 
  CalendarDays, LineChart, Zap, UserCheck, Stethoscope, ChevronRight, Activity, VolumeX
} from 'lucide-react';
import { motion } from 'framer-motion';

// ==========================================
// 0. SUB-KOMPONEN: AUDIO SYNTHESIZER
// ==========================================
const SciFiScannerAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<any>(null);
  const nodesRef = useRef<any[]>([]);
  const hasAutoPlayed = useRef(false);

  const startAudio = async () => {
    if (isPlaying || nodesRef.current.length > 0) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        return; // Blocked by browser
      }
    }

    if (ctx.state !== 'running') return; // Still blocked

    // Use a Dynamics Compressor to make it LOUD and punchy without distortion
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(2.0, ctx.currentTime + 1); // 200% volume master
    
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // 1. Base Electrical Hum (Subtle machine noise)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(55, ctx.currentTime);
    
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(200, ctx.currentTime);
    
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.6, ctx.currentTime); 
    
    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(masterGain);
    humOsc.start();

    // 2. High-Frequency Laser Scanner Beam (Steady flutter)
    const beamOsc = ctx.createOscillator();
    beamOsc.type = 'sine';
    beamOsc.frequency.setValueAtTime(2800, ctx.currentTime); 
    
    const beamGain = ctx.createGain();
    beamGain.gain.setValueAtTime(0.15, ctx.currentTime); 
    
    const beamLFO = ctx.createOscillator();
    beamLFO.type = 'square';
    beamLFO.frequency.setValueAtTime(20, ctx.currentTime); 
    
    const beamLFOGain = ctx.createGain();
    beamLFOGain.gain.setValueAtTime(0.15, ctx.currentTime); 
    
    beamLFO.connect(beamLFOGain);
    beamLFOGain.connect(beamGain.gain);
    
    beamOsc.connect(beamGain);
    beamGain.connect(masterGain);
    
    beamOsc.start();
    beamLFO.start();

    // 3. Pure Robotic Data Processing
    const dataOsc = ctx.createOscillator();
    dataOsc.type = 'square'; 
    
    const dataGain = ctx.createGain();
    dataGain.gain.setValueAtTime(0, ctx.currentTime);
    
    dataOsc.connect(dataGain);
    dataGain.connect(masterGain);
    dataOsc.start();

    const glitchInterval = setInterval(() => {
      if(ctx.state !== 'running') return;
      const now = ctx.currentTime;
      
      if (Math.random() > 0.4) {
        const freq = 1500 + Math.random() * 3000; 
        dataOsc.frequency.setValueAtTime(freq, now);
        dataGain.gain.setValueAtTime(0.3, now);
        dataGain.gain.linearRampToValueAtTime(0, now + 0.05); 
      }
    }, 40);

    nodesRef.current = [humOsc, beamOsc, beamLFO, dataOsc, masterGain, glitchInterval];
    setIsPlaying(true);
    hasAutoPlayed.current = true;
  };

  const stopAudio = () => {
    if (!isPlaying) return;
    const masterGain = nodesRef.current[4];
    if (masterGain && audioCtxRef.current) {
      masterGain.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 1);
      setTimeout(() => {
        nodesRef.current.forEach(node => {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        });
        clearInterval(nodesRef.current[5]);
        nodesRef.current = [];
        setIsPlaying(false);
      }, 1000);
    }
  };

  const toggleAudio = () => {
    if (!isPlaying) {
      startAudio();
    } else {
      stopAudio();
    }
  };

  useEffect(() => {
    // Attempt Auto-Play Strategy
    const handleInteraction = () => {
      if (!hasAutoPlayed.current && !isPlaying) {
        startAudio().then(() => {
          if (hasAutoPlayed.current) {
            // Clean up listeners once successfully started
            ['click', 'scroll', 'touchstart', 'mousemove'].forEach(e => 
              window.removeEventListener(e, handleInteraction)
            );
          }
        });
      }
    };

    // Try immediately (Works if user just navigated here via React Router)
    handleInteraction();

    // Fallback: Start audio on the very first interaction (Browser policy compliance)
    ['click', 'scroll', 'touchstart', 'mousemove'].forEach(e => 
      window.addEventListener(e, handleInteraction, { passive: true })
    );

    return () => {
      ['click', 'scroll', 'touchstart', 'mousemove'].forEach(e => 
        window.removeEventListener(e, handleInteraction)
      );
    };
  }, []);

  return (
    <button 
      onClick={toggleAudio}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-black/80 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/50 hover:scale-105 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] group"
    >
      {isPlaying ? (
        <>
          <div className="flex items-center gap-1 h-4">
            <span className="w-1 h-2/3 bg-cyan-400 animate-[pulse_0.5s_infinite]" />
            <span className="w-1 h-full bg-cyan-400 animate-[pulse_0.3s_infinite]" />
            <span className="w-1 h-1/2 bg-cyan-400 animate-[pulse_0.7s_infinite]" />
          </div>
          <span className="text-[10px] font-mono tracking-widest font-bold">SCANNER AUDIO ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
          <span className="text-[10px] font-mono tracking-widest text-slate-400 group-hover:text-cyan-400">ENABLE SCANNER AUDIO</span>
        </>
      )}
    </button>
  );
};

// ==========================================
// 1. SUB-KOMPONEN: FRAMEWORK STYLE BACKGROUND
// ==========================================
const FrameworkBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
    
    {/* Grid Pattern Ala Next.js / Tailwind UI */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" />
    
    {/* Vibrant Ambient Orbs (Fuchsia, Cyan, Violet) */}
    <motion.div 
      animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[0%] -left-[10%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] blur-[150px] bg-fuchsia-600/20 rounded-full mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, 50, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[40%] -right-[10%] w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] blur-[180px] bg-violet-600/20 rounded-full mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] md:w-[900px] md:h-[900px] blur-[150px] bg-cyan-600/20 rounded-full mix-blend-screen" 
    />
    
    {/* Cinematic AI Hero Image - INTRO ANIMATION */}
    <motion.div 
      initial={{ height: "100vh", opacity: 1 }}
      animate={{ height: "70vh", opacity: 0.4 }}
      transition={{ duration: 1.5, delay: 3, ease: [0.76, 0, 0.24, 1] }}
      className="absolute top-0 left-0 right-0 overflow-hidden"
    >
      {/* Background Image (Ken Burns Animated) */}
      <motion.div 
        animate={{ scale: [1, 1.08, 1], y: [0, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-bottom"
        style={{ backgroundImage: 'url("/images/ai-assets/ai-gym-hero.png")' }}
      />
      
      {/* Scanning Laser Line */}
      <motion.div 
        animate={{ top: ["-10%", "110%", "-10%"] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_30px_8px_rgba(34,211,238,0.8)] z-20 flex justify-center"
      >
        <div className="w-1/2 h-full bg-white shadow-[0_0_10px_2px_white]" />
      </motion.div>

      {/* Scanning Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:60px_60px] z-10" />

      {/* Target Reticles (Corners) */}
      <div className="absolute top-[20%] left-[20%] w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 z-10" />
      <div className="absolute top-[20%] right-[20%] w-16 h-16 border-r-2 border-t-2 border-cyan-500/50 z-10" />
      <div className="absolute bottom-[20%] left-[20%] w-16 h-16 border-l-2 border-b-2 border-cyan-500/50 z-10" />
      <div className="absolute bottom-[20%] right-[20%] w-16 h-16 border-r-2 border-b-2 border-cyan-500/50 z-10" />

      {/* Dynamic Mask Overlay - Fades in as it shrinks */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 3, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-30"
      />
    </motion.div>
  </div>
);

// ==========================================
// 2. SUB-KOMPONEN: MODERN FRAMEWORK FEATURE CARD
// ==========================================
const ModernFeatureCard = ({ icon: Icon, title, desc, tag, imagePath, delay = 0 }: { icon: any, title: string, desc: string, tag: string, imagePath: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="group flex flex-col bg-[#050505] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-xl"
  >
    {/* Cover Image Section */}
    <div className="h-48 w-full relative overflow-hidden border-b border-white/5 bg-slate-900">
      <img 
        src={imagePath} 
        alt={title} 
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80" />
      <div className="absolute bottom-4 left-4">
        <span className="px-2.5 py-1 text-[10px] font-mono font-medium tracking-widest text-cyan-300 bg-cyan-950/80 border border-cyan-800 rounded-md backdrop-blur-md uppercase">
          {tag}
        </span>
      </div>
    </div>
    
    {/* Content Section */}
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:bg-cyan-950/30 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed font-light">{desc}</p>
    </div>
  </motion.div>
);

// ==========================================
// 3. SUB-KOMPONEN: HOLOGRAPHIC FOUNDER CARD
// ==========================================
const HolographicTeamCard = ({ icon: Icon, role, name, imageUrl, desc, delay = 0 }: { icon: any, role: string, name: string, imageUrl: string, desc: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-50px" }}
    transition={{ duration: 0.7, delay }}
    className="group flex flex-col relative rounded-3xl overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/5 hover:border-cyan-500/40 transition-all duration-700 w-full h-[500px] md:h-[600px] shadow-2xl hover:shadow-[0_0_50px_rgba(34,211,238,0.15)] hover:-translate-y-2"
  >
    {/* Animated Background Tech Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none" />
    
    {/* Holographic Scanning Line */}
    <motion.div 
      animate={{ y: ["-10px", "650px"] }} 
      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_2px_#22d3ee] z-20 opacity-0 group-hover:opacity-100 mix-blend-screen" 
    />
    
    {/* Image Container (Portrait Format) */}
    <div className="absolute inset-0 w-full h-full z-0">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0" 
        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=050505&color=22D3EE&bold=true&size=512`; }} 
      />
      {/* Vignet & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 to-transparent" />
    </div>

    {/* Content Overlay */}
    <div className="relative z-10 flex flex-col h-full p-8 justify-between">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-start">
         <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400 font-mono text-[10px] uppercase tracking-widest shadow-lg">
           <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_#22d3ee]" /> System Active
         </span>
         <div className="w-12 h-12 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-500">
           <Icon className="w-6 h-6" />
         </div>
      </div>

      {/* Text Details (Slides up on hover) */}
      <div className="transform translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <h4 className="text-[11px] md:text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-3 drop-shadow-md">{role}</h4>
        <h3 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight uppercase drop-shadow-lg leading-none">{name}</h3>
        
        {/* Hidden on default, appears gracefully on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
           <div className="w-full h-px bg-white/10 mb-5 relative overflow-hidden">
             <motion.div 
                initial={{ x: "-100%" }}
                whileInView={{ x: "200%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" 
             />
           </div>
           <p className="text-slate-300 text-sm leading-relaxed font-light line-clamp-4">{desc}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// ==========================================
// 4. MAIN COMPONENT: FRAMEWORK SAAS LANDING PAGE
// ==========================================
export default function LandingPage({ founders = [] }: { founders: any[] }) {
  const { data, setData, post, processing, errors, wasSuccessful } = useForm({ company_name: '', pic_name: '', phone_number: '', email: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/request-demo', { onSuccess: () => { if(!errors) { alert('Request demo berhasil terkirim!'); setShowForm(false); } } });
  };

  return (
    <>
      <Head title="ERP Infrastructure - PT Solusi Mitra Mandiri" />
      <SciFiScannerAudio />
      <div className="min-h-screen bg-transparent text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-white relative overflow-x-hidden">
        
        <FrameworkBackground />

        {/* --- 1. HERO SECTION (CLEAN TYPOGRAPHY) --- */}
        <motion.header 
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }} 
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
          transition={{ duration: 1.2, delay: 3.5, ease: "easeOut" }}
          className="relative max-w-7xl mx-auto px-4 pt-48 pb-24 text-center z-10 flex flex-col items-center min-h-screen justify-center md:min-h-0 md:justify-start"
        >
          <a href="#" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors mb-8 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse"></span>
            Memperkenalkan Infrastruktur FitOS 2.0
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </a>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto mb-6 leading-[1.1]">
            Arsitektur Perangkat Lunak untuk <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500">
              Operasional Mega-Gym
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Sistem ERP komprehensif yang dirancang untuk otomasi skala enterprise. Menyambungkan CRM, POS, Edge AI Biometrics, dan analitik data dalam satu pangkalan data relasional.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-sm">
              Deploy Ekosistem <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm">
              Baca Dokumentasi
            </button>
          </div>
        </motion.header>

        {/* --- MODAL FORM CLEAN --- */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 max-w-xl w-full shadow-2xl relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-2">X</button>
              <h3 className="text-xl font-bold text-white mb-2">Request Deployment</h3>
              <p className="text-slate-400 text-sm mb-6">Konsultasikan kebutuhan spesifik infrastruktur PT Solusi Mitra Mandiri Anda.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Nama Perusahaan</label>
                    <input type="text" required value={data.company_name} onChange={e => setData('company_name', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-white transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Penanggung Jawab</label>
                    <input type="text" required value={data.pic_name} onChange={e => setData('pic_name', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-white transition-all"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Nomor Telepon / WA</label>
                    <input type="text" required value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-white transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Alamat Email</label>
                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-white transition-all"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Catatan Tambahan</label>
                  <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-white transition-all"></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={processing} className="w-full py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    {processing ? 'Memproses...' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* --- 2. EXECUTIVE LEADERSHIP (HOLOGRAPHIC PROFILES) --- */}
        <section className="max-w-7xl mx-auto px-4 py-32 relative z-10">
          <div className="flex flex-col items-center mb-20 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-6">
              <Users className="w-4 h-4" /> The Architects
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Kepemimpinan Eksekutif</h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl">Memadukan keahlian rekayasa perangkat lunak tingkat tinggi, sains data, dan tata kelola bisnis korporasi dalam satu pilar arsitektur yang solid.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {founders && founders.length > 0 ? (
              founders.map((founder: any, index: number) => {
                const icons = [Layers, Cpu, Terminal];
                return <HolographicTeamCard key={founder.id || index} icon={icons[index] || Layers} role={founder.role} name={founder.name} imageUrl={founder.image_path} desc={founder.description} delay={0.1 * index} />;
              })
            ) : (
              <>
                <HolographicTeamCard icon={Layers} role="Director of Product" name="Founder Product" imageUrl="/images/founders/founder-product.png" desc="Memimpin visi strategis dan peta jalan pengembangan ekosistem ERP yang holistik." delay={0.1} />
                <HolographicTeamCard icon={Cpu} role="Chief Technology Officer" name="Founder Tech" imageUrl="/images/founders/founder-cto.png" desc="Arsitek utama di balik integrasi mutakhir infrastruktur berbasis kecerdasan buatan." delay={0.2} />
                <HolographicTeamCard icon={Terminal} role="Head of Software" name="Founder Engineer" imageUrl="/images/founders/founder-engineering.png" desc="Pakar rekayasa perangkat lunak yang memimpin optimasi performa inti aplikasi." delay={0.3} />
              </>
            )}
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* --- 3. THE DATA PIPELINE (CYBER-TIMELINE) --- */}
        <section className="max-w-6xl mx-auto px-4 py-32 relative z-10">
          <div className="text-center mb-24">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-6">
              <Activity className="w-4 h-4" /> System Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Pipeline Otomatisasi Member</h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Siklus hidup end-to-end: merubah entitas prospek mentah menjadi aliran data aktif yang mengamankan pendapatan berulang.</p>
          </div>

          <div className="relative">
            {/* The Hz Wave Cyber Backbone */}
            <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-[50px] -translate-x-1/2 overflow-hidden z-0 flex justify-center">
              
              {/* Animated SVG Wave Background (Infinite Scroll) */}
              <motion.div 
                animate={{ y: [0, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[200px] bottom-0 w-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 25 0 C 50 30, 50 70, 25 100 C 0 130, 0 170, 25 200' stroke='rgb(34,211,238)' fill='none' stroke-width='2' opacity='0.8' /%3E%3Cpath d='M 25 0 C 40 10, 40 40, 25 50 C 10 60, 10 90, 25 100 C 40 110, 40 140, 25 150 C 10 160, 10 190, 25 200' stroke='rgb(59,130,246)' fill='none' stroke-width='1.5' opacity='0.5' /%3E%3Cpath d='M 25 0 C 35 5, 35 20, 25 25 C 15 30, 15 45, 25 50 C 35 55, 35 70, 25 75 C 15 80, 15 95, 25 100 C 35 105, 35 120, 25 125 C 15 130, 15 145, 25 150 C 35 155, 35 170, 25 175 C 15 180, 15 195, 25 200' stroke='rgb(255,255,255)' fill='none' stroke-width='0.5' opacity='0.3' /%3E%3Cline x1='25' y1='0' x2='25' y2='200' stroke='rgb(34,211,238)' stroke-width='1' opacity='0.2' /%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-y',
                  backgroundSize: '100% 200px',
                  backgroundPosition: 'center top'
                }}
              />

              {/* Glowing Scanner overlaying the wave */}
              <motion.div 
                animate={{y: ["-200%", "8000%"]}} 
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }} 
                className="absolute top-0 w-full h-64 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent shadow-[0_0_20px_2px_#22d3ee] mix-blend-screen" 
              />
            </div>

            <div className="space-y-16 md:space-y-32">
              {[
                { step: "PHASE_01", icon: "/images/ai-assets/icon-journey-1.png", title: "Lead Gen & Funnel", desc: "Membership Consultant mengelola prospek. Perubahan state menjadi 'Joined' menginisiasi webhook mutasi data." },
                { step: "PHASE_02", icon: "/images/ai-assets/icon-journey-2.png", title: "POS State Hydration", desc: "Transaksi divalidasi. Database dihidrasi otomatis dengan masa aktif baru, sinkronisasi stok, & kuota PT." },
                { step: "PHASE_03", icon: "/images/ai-assets/icon-journey-3.png", title: "Biometric Enrollment", desc: "Pendaftaran parameter wajah melalui Kiosk mandiri. Sinkronisasi edge-to-cloud untuk akses tanpa kartu." },
                { step: "PHASE_04", icon: "/images/ai-assets/icon-journey-4.png", title: "AI Inference Plan", desc: "Mesin OpenRouter LLM memproses payload JSON kebugaran dan mereturn Workout Plan generatif presisi tinggi." }
              ].map((item, index) => (
                <motion.div 
                  key={item.step} 
                  initial={{ opacity: 0, y: 40 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: false, margin: "-100px" }} 
                  transition={{ duration: 0.7, delay: 0.1 }} 
                  className="relative flex flex-col md:flex-row items-center w-full group"
                >
                  
                  {/* Spacer for alternating layout (Desktop only) */}
                  <div className={`hidden md:block w-1/2 ${index % 2 === 0 ? 'md:order-3' : 'md:order-1'}`} />

                  {/* HUGE Center Cyber Node */}
                  <div className={`absolute top-0 md:top-auto left-0 md:left-1/2 md:-translate-x-1/2 w-20 h-20 md:w-40 md:h-40 shrink-0 rounded-[2rem] md:rounded-[3rem] bg-slate-900 border-4 md:border-8 border-slate-950 flex items-center justify-center z-10 overflow-hidden group-hover:border-cyan-500/50 transition-colors duration-500 shadow-[0_0_0_2px_rgba(255,255,255,0.05)] md:shadow-[0_0_0_4px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]`}>
                    <img src={item.icon} alt={item.title} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Holographic Content Box */}
                  <div className={`w-full md:w-1/2 flex pl-28 md:pl-0 ${index % 2 === 0 ? 'md:justify-end md:pr-28 md:order-1' : 'md:justify-start md:pl-28 md:order-3'}`}>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 group-hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden backdrop-blur-sm w-full max-w-[420px] group-hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.15)] group-hover:-translate-y-1">
                       
                       {/* Cyber Glow Line */}
                       <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       
                       {/* Background Tech Grid */}
                       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                       
                       <div className="relative z-10">
                         <div className="flex items-center justify-between mb-6">
                           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#000] border border-cyan-500/20 text-cyan-400 font-mono text-[10px] uppercase tracking-widest shadow-inner">
                             <Zap className="w-3 h-3 text-cyan-400" /> {item.step}
                           </span>
                           <span className="text-white/10 font-mono text-2xl font-black group-hover:text-cyan-500/10 transition-colors">0{index + 1}</span>
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-50 transition-colors">{item.title}</h3>
                         <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                       </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 4. ROLE-BASED CONTROL (BENTO GRID - CLEAN) --- */}
        <section className="bg-slate-900/30 backdrop-blur-md border-y border-white/5 py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">RBAC (Role-Based Access Control)</h2>
              <p className="text-slate-400 text-sm max-w-xl">Akses yang terpartisi secara tegas. Setiap fungsi jabatan menerima antarmuka khusus (Middleware tersendiri) untuk memaksimalkan efisiensi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  role: "Membership Consultant", 
                  type: "square", 
                  icon: "/images/ai-assets/icon-role-1.png", 
                  desc: "Akses read-only ke Cohort Analysis, pelacakan Funnel Ratios, dan modul Follow Up harian dengan filter waktu." 
                },
                { 
                  role: "Customer Service", 
                  type: "square", 
                  icon: "/images/ai-assets/icon-role-2.png", 
                  desc: "Modul write-access POS, pencetakan struk digital, manipulasi state kedatangan, dan booking kelas instruktur." 
                },
                { 
                  role: "Admin & Manager", 
                  type: "tall", 
                  icon: "/images/ai-assets/icon-role-4.png", 
                  desc: "Akses Root (Level 0). Memiliki kontrol penuh atas seluruh sistem, manajemen otorisasi middleware (Roles), audit log aktivitas seluruh karyawan, penetapan Real-time KPI, serta analitik komprehensif untuk proyeksi finansial bisnis Gym." 
                },
                { 
                  role: "Personal Trainer", 
                  type: "wide", 
                  icon: "/images/ai-assets/icon-role-3.png", 
                  desc: "Otorisasi khusus untuk pencatatan session logs, pengawalan Gym Orientation harian, manajemen target anatomi klien, dan mutation data komposisi tubuh (Body Metric). Dirancang khusus untuk workflow on-the-floor tanpa membebani kompleksitas antarmuka." 
                }
              ].map((role, idx) => {
                const isTall = role.type === 'tall';
                const isWide = role.type === 'wide';
                const isSquare = role.type === 'square';

                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: false, margin: "-50px" }} 
                    transition={{ duration: 0.5, delay: idx * 0.1 }} 
                    className={`
                      bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden
                      hover:border-cyan-500/30 transition-all duration-500 group relative p-8 shadow-2xl
                      hover:shadow-[0_10px_40px_-10px_rgba(34,211,238,0.15)] hover:-translate-y-1
                      ${isTall ? 'md:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col' : ''}
                      ${isWide ? 'md:col-span-2 lg:col-span-2 lg:row-span-1 flex flex-col md:flex-row items-center gap-8' : ''}
                      ${isSquare ? 'col-span-1 flex flex-col' : ''}
                    `}
                  >
                    {/* Background decoration */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />
                    
                    {/* Tech Background Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay pointer-events-none" />

                    {/* Image container */}
                    <div className={`
                      shrink-0 rounded-2xl overflow-hidden bg-black border border-white/5 
                      shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]
                      transition-all duration-500 z-10 relative
                      ${isTall ? 'w-full aspect-[4/3] mb-8' : ''}
                      ${isWide ? 'w-full md:w-[40%] aspect-[4/3] md:aspect-square mb-6 md:mb-0 md:order-2' : ''}
                      ${isSquare ? 'w-16 h-16 mb-8 border-cyan-500/20 p-1' : ''}
                    `}>
                       <img src={role.icon} alt={role.role} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 ${isSquare ? 'rounded-xl' : ''}`} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Text Content */}
                    <div className={`relative z-10 flex-1 flex flex-col ${isWide ? 'md:order-1' : ''}`}>
                       {isTall && (
                         <div className="mb-4">
                           <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-950 border border-cyan-800 shadow-[0_0_15px_rgba(34,211,238,0.2)] text-cyan-400">
                             <Shield className="w-5 h-5" />
                           </span>
                         </div>
                       )}
                       
                       <h3 className={`font-bold text-white mb-3 group-hover:text-cyan-50 transition-colors ${isTall ? 'text-2xl' : 'text-xl'}`}>{role.role}</h3>
                       <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{role.desc}</p>
                       
                       {/* Button / Indicator for Admin */}
                       {isTall && (
                         <div className="mt-auto pt-8">
                           <div className="w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />
                           <span className="inline-flex items-center gap-2 text-cyan-400 text-[10px] font-mono uppercase tracking-widest bg-cyan-950/30 px-3 py-1.5 rounded-md border border-cyan-800/30">
                              <Database className="w-3 h-3" /> System Root Auth
                           </span>
                         </div>
                       )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- 5. DEEP-TECH ARCHITECTURE (SPLIT VIEW) --- */}
        <section className="max-w-7xl mx-auto px-4 py-24 relative z-10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-6">
                <Activity className="w-3 h-3" /> System Architecture
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Kecerdasan Buatan Terdistribusi</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg">
                Dibangun di atas infrastruktur *cloud-native*. PT Solusi Mitra Mandiri memanfaatkan komputasi AI *Edge* dan *Cloud LLM* untuk pengambilan keputusan yang deterministik.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Edge AI Biometrics (face-api.js)", desc: "Inferensi pengenalan wajah dilakukan langsung pada *browser node* di Kiosk tanpa beban latensi server pusat." },
                  { icon: BrainCircuit, title: "LLM Orchestration", desc: "Mengekstrak anomali tulang belakang (*posture scan*) dan me-return struktur JSON kustom dari OpenRouter LLM." },
                  { icon: CheckCircle, title: "Automated State Machine", desc: "CRON Job *headless* yang menormalkan sisa kuota sesi dan mendeteksi anomali lupa *log-out* pada sesi malam hari." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-100 transition-colors">{item.title}</h4>
                      <p className="text-slate-400 text-xs font-light leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Elegant Tech Image Container */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.6 }} className="relative h-[350px] md:h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-md shadow-[0_0_50px_rgba(34,211,238,0.1)] p-2 group mt-12 lg:mt-0">
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-2 z-0 overflow-hidden rounded-xl border border-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 to-blue-900/20 z-10" />
                <img src="/images/ai-assets/feature-ai-posture.png" alt="Architecture" className="w-full h-full object-cover opacity-70 mix-blend-screen grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.15)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none mix-blend-overlay" />
                
                {/* Holographic Scanning Laser */}
                <motion.div 
                  animate={{ top: ["-10%", "110%"] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_30px_8px_rgba(34,211,238,0.8)] z-20 flex justify-center"
                >
                   <div className="w-1/2 h-full bg-white shadow-[0_0_10px_2px_white]" />
                </motion.div>
                
                {/* Scanning Reticles */}
                <div className="absolute top-[10%] left-[10%] w-10 h-10 border-l-2 border-t-2 border-cyan-400/70 z-20" />
                <div className="absolute bottom-[10%] right-[10%] w-10 h-10 border-r-2 border-b-2 border-cyan-400/70 z-20" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- 6. MODUL GRID SECTION (CLEAN CARDS) --- */}
        <section className="max-w-7xl mx-auto px-4 py-24 border-t border-white/5 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Direktori Modul Fungsional</h2>
              <p className="text-slate-400 text-sm max-w-xl font-light">Enam pilar utama yang menjadi pondasi ekosistem operasional PT Solusi Mitra Mandiri.</p>
            </div>
            <button className="text-sm font-medium text-white hover:text-cyan-400 transition-colors flex items-center gap-2">
              Lihat Spesifikasi Lengkap <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernFeatureCard tag="Module 01" icon={Users} title="CRM & Leads Funnel" desc="Manajemen prospek hulu dengan pipeline status kustom. Konversi terekam pada basis data relasional anggota." imagePath="/images/ai-assets/feature-crm.png" delay={0.1} />
            <ModernFeatureCard tag="Module 02" icon={Terminal} title="POS & Inventory" desc="Sistem pembayaran kasir yang terintegrasi langsung dengan mutasi stok gudang dan aktivasi *session token* PT." imagePath="/images/ai-assets/feature-pos.png" delay={0.2} />
            <ModernFeatureCard tag="Module 03" icon={QrCode} title="Biometric Security" desc="Implementasi absensi mutakhir via wajah dan sidik jari untuk validasi kehadiran berpresisi tinggi." imagePath="/images/ai-assets/feature-biometric.png" delay={0.3} />
            <ModernFeatureCard tag="Module 04" icon={Cpu} title="Generative AI Planner" desc="Model bahasa besar (LLM) yang meracik kalender *Workout* dan *Meal Plan* otomatis berdasarkan diagnosis postur." imagePath="/images/ai-assets/feature-ai-posture.png" delay={0.4} />
            <ModernFeatureCard tag="Module 05" icon={BarChart3} title="Executive Analytics" desc="Dasbor analitik visual menampilkan matriks pendapatan, retensi kohort, dan rekapitulasi konversi harian." imagePath="/images/ai-assets/feature-dashboard.png" delay={0.5} />
            <ModernFeatureCard tag="Module 06" icon={Shield} title="Front Desk Check-in" desc="Antarmuka antrean mandiri dan registrasi kelas instruktur untuk memaksimalkan efisiensi *traffic* harian." imagePath="/images/ai-assets/feature-kiosk.png" delay={0.6} />
          </div>
        </section>

        {/* --- FOOTER CLEAN --- */}
        <footer className="border-t border-white/10 bg-[#000000] py-12 relative z-10 text-center">
          <p className="text-slate-500 text-xs font-mono">
            © 2026 PT Solusi Mitra Mandiri. All rights reserved. <br/>
            Engineered for High-Performance Enterprise.
          </p>
        </footer>

      </div>
    </>
  );
}
