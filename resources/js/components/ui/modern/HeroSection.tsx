import React from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Empowering Your Business with <span className="highlight">FitOS ERP</span></h1>
        <p className="hero-subtitle">Streamline operations, boost productivity, and drive growth with PT Solusi Mitra Mandiri's cutting-edge enterprise software, FitOS ERP.</p>
        <div className="hero-actions">
          <button className="btn-primary">Request Demo</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
      <div className="hero-graphics">
        <div className="glass-panel main-panel">
          <div className="panel-header">Dashboard Overview</div>
          <div className="panel-body">
            <div className="chart-bar"></div>
            <div className="chart-bar half"></div>
            <div className="chart-bar full"></div>
          </div>
        </div>
        <div className="glass-panel side-panel top"></div>
        <div className="glass-panel side-panel bottom"></div>
      </div>
      <div className="ambient-light light-1"></div>
      <div className="ambient-light light-2"></div>
    </section>
  );
};

export default HeroSection;
