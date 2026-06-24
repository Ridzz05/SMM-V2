import React from 'react';
import './TeamSection.css';

const TeamSection: React.FC = () => {
  const team = [
    {
      name: 'Michael',
      role: 'Co-Founder & Director of Product Development',
      image: '/images/founders/founder-product.png'
    },
    {
      name: 'Sarah',
      role: 'Co-Founder & Chief Technology Officer',
      image: '/images/founders/founder-cto.png'
    },
    {
      name: 'David',
      role: 'Co-Founder & Head of Software Engineering',
      image: '/images/founders/founder-engineering.png'
    }
  ];

  return (
    <section id="team" className="team-section">
      <div className="team-header">
        <h2 className="section-title">Visionary Leadership</h2>
        <p className="section-subtitle">Meet the minds driving innovation at PT Solusi Mitra Mandiri.</p>
      </div>
      <div className="team-container">
        {team.map((member, index) => (
          <div key={index} className={`team-member-block block-${index + 1}`}>
            <div className="member-image-wrapper">
              <img src={member.image} alt={member.name} className="member-image" />
            </div>
            <div className="member-info glass-card">
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
