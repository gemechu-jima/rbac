import React, { useState, useEffect } from 'react';
import './IntroPage.css';
import { Link } from 'react-router-dom';

const IntroPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [fireParticles, setFireParticles] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [flames, setFlames] = useState([]);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Create fire particles
    const particles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 25 + 8,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.8 + 0.2
    }));
    if(particles){
      setFireParticles(particles);
    }

    // Create sparks
    const sparkArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2
    }));
    setSparks(sparkArray);

    // Create floating flames
    const flameArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 5,
      drift: Math.random() * 20 - 10
    }));
    setFlames(flameArray);

    // Continuous animation updates
    const interval = setInterval(() => {
      // Occasionally add new sparks
      if (Math.random() > 0.7) {
        const newSpark = {
          id: Date.now(),
          left: Math.random() * 100,
          top: 80 + Math.random() * 20,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 1.5 + 0.5,
          delay: 0
        };
        setSparks(prev => [...prev.slice(-14), newSpark]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEnterMap = () => {
    setIsVisible(false);
    setTimeout(() => {
      onEnterMap();
    }, 800);
  };

  return (
    <div className="intro-page">
      {/* Enhanced Animated Background */}
      <div className="animated-bg">
        {/* Main fire container */}
        <div className="fire-container">
          {fireParticles.map(particle => (
            <div
              key={particle.id}
              className="fire-particle"
              style={{
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                opacity: particle.opacity
              }}
            />
          ))}
        </div>

        {/* Floating flames */}
        <div className="flames-container">
          {flames.map(flame => (
            <div
              key={flame.id}
              className="floating-flame"
              style={{
                left: `${flame.left}%`,
                width: `${flame.size}px`,
                height: `${flame.size * 1.5}px`,
                animationDuration: `${flame.duration}s`,
                animationDelay: `${flame.delay}s`,
                filter: `hue-rotate(${flame.drift * 5}deg)`
              }}
            />
          ))}
        </div>

        {/* Sparks */}
        <div className="sparks-container">
          {sparks.map(spark => (
            <div
              key={spark.id}
              className="spark"
              style={{
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                animationDuration: `${spark.duration}s`,
                animationDelay: `${spark.delay}s`
              }}
            />
          ))}
        </div>

        {/* Base flames */}
        <div className="base-flames">
          <div className="base-flame flame-1"></div>
          <div className="base-flame flame-2"></div>
          <div className="base-flame flame-3"></div>
          <div className="base-flame flame-4"></div>
        </div>

        {/* Fire glow effect */}
        <div className="fire-glow"></div>
      </div>

      {/* Main Content */}
      <div className={`intro-content ${isVisible ? 'visible' : ''}`}>
        {/* Header with enhanced fire icon */}
        <div className="header-section">
          <div className="fire-logo">
            <div className="fire-icon">
              <div className="flame-core"></div>
              <div className="flame-main"></div>
              <div className="flame-left"></div>
              <div className="flame-right"></div>
              <div className="flame-spark-1"></div>
              <div className="flame-spark-2"></div>
            </div>
          </div>
          <h1 className="intro-title">
            Fire Safety
            <span className="title-accent">Monitoring System</span>
          </h1>
          <p className="intro-subtitle">
            Real-time risk assessment and intelligent fire protection
          </p>
        </div>

        {/* Features Grid with Enhanced Animation */}
        <div className="features-grid">
          {[
            { icon: '🔥', title: 'Real-time Risk Assessment', text: 'Monitor temperature, humidity, wind speed, and fire risk indices' },
            { icon: '🤖', title: 'Automated Coverage', text: 'Intelligent fire extinguisher placement based on dynamic risk levels' },
            { icon: '🗺️', title: 'Zone Management', text: 'Visualize safety coverage and identify risk across different zones' },
            { icon: '📊', title: 'Smart Analytics', text: 'Data-driven recommendations for optimal resource allocation' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="feature-card" 
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <div className="feature-glow"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Coverage Strategy */}
        <div className="coverage-section">
          <h2>Smart Coverage Strategy</h2>
          <div className="coverage-levels">
            {[
              { risk: 'High Risk', extinguishers: '10 extinguishers', coverage: '500m coverage', color: '#ff4444' },
              { risk: 'Medium Risk', extinguishers: '7 extinguishers', coverage: '300m coverage', color: '#ffaa00' },
              { risk: 'Low Risk', extinguishers: '4 extinguishers', coverage: '200m coverage', color: '#00ff00' }
            ].map((level, index) => (
              <div key={index} className={`coverage-item ${level.risk.toLowerCase().replace(' ', '-')}`}>
                <span 
                  className="risk-dot"
                  style={{ 
                    backgroundColor: level.color,
                    boxShadow: `0 0 20px ${level.color}`
                  }}
                ></span>
                <div className="coverage-info">
                  <strong>{level.risk}</strong>
                  <span>{level.extinguishers}, {level.coverage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Animated Button */}
        <div className="button-container">
          <button 
            className="enter-button"
            onClick={handleEnterMap}
          >
            <Link to={"/login"} className="button-text">Enter Fire Safety Map</Link>
            <span className="button-icon">🚀</span>
            <div className="button-flames">
              <div className="button-flame-1"></div>
              <div className="button-flame-2"></div>
              <div className="button-flame-3"></div>
            </div>
            <div className="button-glow"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;