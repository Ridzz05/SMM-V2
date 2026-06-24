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
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Base Background */}
    <div className="absolute inset-0 bg-[#000000]" />
    
    {/* Grid Pattern Ala Next.js / Tailwind UI */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    
    {/* Subtle Glow di Tengah Atas (Infinite Pulse) */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.9, 1.1, 0.9] }}
      transition={{ opacity: { delay: 4, duration: 2 }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
      className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] blur-[100px] bg-cyan-600 rounded-full" 
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
// 3. SUB-KOMPONEN: CRISP FOUNDER CARD
// ==========================================
const CrispTeamCard = ({ icon: Icon, role, name, imageUrl, desc, delay = 0 }: { icon: any, role: string, name: string, imageUrl: string, desc: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="group flex flex-col bg-[#050505] border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-2xl relative"
  >
    <div className="w-full aspect-square relative overflow-hidden bg-slate-900">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=F8FAFC&bold=true&size=512`; }} 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-90" />
      
      <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-cyan-400 shadow-lg">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    
    <div className="p-6 md:p-8 flex flex-col relative z-10 -mt-24">
      <h4 className="text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase mb-2 drop-shadow-md">{role}</h4>
      <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-none drop-shadow-md">{name}</h3>
      <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light opacity-90">{desc}</p>
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
      <div className="min-h-screen bg-[#000000] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-white relative overflow-x-hidden">
        
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

        {/* --- 2. FOUNDING TEAM SECTION (CRISP) --- */}
        <section className="max-w-6xl mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Kepemimpinan Eksekutif</h2>
            <p className="text-slate-400 text-sm max-w-xl">Memadukan keahlian rekayasa perangkat lunak, sains data, dan tata kelola bisnis korporasi dalam satu pilar arsitektur.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders && founders.length > 0 ? (
              founders.map((founder: any, index: number) => {
                const icons = [Layers, Cpu, Terminal];
                return <CrispTeamCard key={founder.id || index} icon={icons[index] || Layers} role={founder.role} name={founder.name} imageUrl={founder.image_path} desc={founder.description} delay={0.1 * index} />;
              })
            ) : (
              <>
                <CrispTeamCard icon={Layers} role="Director of Product" name="Founder Product" imageUrl="/images/founders/founder-product.png" desc="Memimpin visi strategis dan peta jalan pengembangan ekosistem ERP." delay={0.1} />
                <CrispTeamCard icon={Cpu} role="Chief Technology Officer" name="Founder Tech" imageUrl="/images/founders/founder-cto.png" desc="Arsitek utama di balik integrasi mutakhir berbasis kecerdasan buatan." delay={0.2} />
                <CrispTeamCard icon={Terminal} role="Head of Software" name="Founder Engineer" imageUrl="/images/founders/founder-engineering.png" desc="Pakar rekayasa perangkat lunak yang memimpin performa inti aplikasi." delay={0.3} />
              </>
            )}
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* --- 3. THE MEMBER JOURNEY (CLEAN TIMELINE) --- */}
        <section className="max-w-5xl mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pipeline Otomatisasi Member</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Siklus hidup end-to-end: dari prospek mentah hingga menjadi entitas data aktif yang mengamankan pendapatan berulang.</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-white/10" />
            
            <div className="space-y-16">
              {[
                { step: "01", icon: "/images/ai-assets/icon-journey-1.png", title: "Lead Generation & Funnel", desc: "Membership Consultant mengelola prospek (Follow Up, Appointment, Show). Perubahan state menjadi 'Joined' menginisiasi *webhook*." },
                { step: "02", icon: "/images/ai-assets/icon-journey-2.png", title: "POS & State Hydration", desc: "Transaksi divalidasi. Mutasi ini otomatis menghidrasi database dengan masa aktif baru, memotong stok gudang, dan mengisi relasi kuota PT." },
                { step: "03", icon: "/images/ai-assets/icon-journey-3.png", title: "Biometric Enrollment", desc: "Pendaftaran parameter wajah melalui Kiosk mandiri. Sinkronisasi *edge-to-cloud* yang memitigasi anomali kehadiran." },
                { step: "04", icon: "/images/ai-assets/icon-journey-4.png", title: "Gym Orientation & AI Inference", desc: "Asesmen kebugaran perdana. Mesin *OpenRouter LLM* menerima *payload* JSON dan mereturn *Workout Plan* generatif yang presisi." }
              ].map((item, index) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:justify-between group">
                  
                  {/* Left Side (Content for Evens, Empty for Odds) */}
                  <div className={`flex-1 pl-20 md:pl-0 md:text-right ${index % 2 !== 0 ? 'md:order-1' : 'md:order-3'}`}>
                    <div className={`md:max-w-sm ${index % 2 !== 0 ? 'ml-auto' : ''}`}>
                      <span className="text-cyan-500 font-mono text-xs font-semibold tracking-wider block mb-2">Phase {item.step}</span>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className={`absolute left-0 md:static md:order-2 w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:border-cyan-400/60 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all z-10 shrink-0 overflow-hidden p-1`}>
                    <img src={item.icon} alt={item.title} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Right Side (Empty for Evens, Content for Odds) */}
                  <div className="flex-1 hidden md:block md:order-1" />

                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 4. ROLE-BASED CONTROL (BENTO GRID - CLEAN) --- */}
        <section className="bg-[#050505] border-y border-white/5 py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">RBAC (Role-Based Access Control)</h2>
              <p className="text-slate-400 text-sm max-w-xl">Akses yang terpartisi secara tegas. Setiap fungsi jabatan menerima antarmuka khusus (Middleware tersendiri) untuk memaksimalkan efisiensi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: "Membership Consultant", icon: "/images/ai-assets/icon-role-1.png", desc: "Akses *read-only* ke Cohort Analysis, pelacakan Funnel Ratios, dan modul Follow Up harian dengan filter waktu." },
                { role: "Customer Service", icon: "/images/ai-assets/icon-role-2.png", desc: "Modul *write-access* POS, pencetakan struk digital, manipulasi *state* kedatangan, dan *booking* kelas instruktur." },
                { role: "Personal Trainer", icon: "/images/ai-assets/icon-role-3.png", desc: "Otorisasi khusus untuk pencatatan *session logs*, pengawalan Gym Orientation, dan *mutation* data anatomi member." },
                { role: "Admin & Manager", icon: "/images/ai-assets/icon-role-4.png", desc: "Hak akses *Root*. Analitik komprehensif, *Real-time KPI*, manajemen *roles*, dan audit histori transaksi log." }
              ].map((role, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:bg-[#111] hover:border-white/20 transition-all group flex flex-col h-full">
                  <div className="w-14 h-14 rounded-xl bg-black border border-cyan-500/20 flex items-center justify-center text-slate-400 group-hover:border-cyan-400/50 mb-5 transition-colors overflow-hidden p-0.5 shadow-lg group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <img src={role.icon} alt={role.role} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{role.role}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-auto">{role.desc}</p>
                </motion.div>
              ))}
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
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.6 }} className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#050505] shadow-2xl p-2 hidden lg:block">
              <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-blue-900/10" />
                <img src="/images/ai-assets/feature-ai-posture.png" alt="Architecture" className="w-full h-full object-cover rounded-xl opacity-60 mix-blend-screen" />
              </motion.div>
              
              {/* Overlay UI mockup elements */}
              <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-16 left-8 right-8 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="ml-2 text-[10px] font-mono text-slate-500">POSTURE_ANALYSIS.json</span>
                </div>
                <div className="font-mono text-[10px] text-cyan-400 leading-relaxed">
                  {`{\n  "status": 200,\n  "data": {\n    "confidence": 0.98,\n    "detected_anomalies": ["kyphosis_mild"],\n    "recommendation": "generate_workout_plan"\n  }\n}`}
                </div>
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
