import React from 'react';
import './FeaturesGrid.css';

const FeaturesGrid: React.FC = () => {
  const features = [
    {
      title: 'Automated Workflows',
      description: 'Streamline your daily operations with intelligent, rule-based automation tailored to your business logic.',
      icon: '⚙️'
    },
    {
      title: 'Real-time Analytics',
      description: 'Make data-driven decisions instantly with our interactive and customizable dashboards.',
      icon: '📊'
    },
    {
      title: 'Secure Cloud Infrastructure',
      description: 'Enterprise-grade security ensuring your sensitive business data is protected 24/7.',
      icon: '🛡️'
    },
    {
      title: 'Seamless Integration',
      description: 'Connect all your existing tools and third-party services into one cohesive platform.',
      icon: '🔗'
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="features-header">
        <h2 className="section-title">Next-Gen ERP Capabilities</h2>
        <p className="section-subtitle">Everything you need to scale your enterprise efficiently.</p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="glass-card feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
