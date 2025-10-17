import React from 'react';
import './Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to FriendZone</h1>
            <p className="hero-subtitle">
              Your journey to excellence starts here
            </p>
            <div className="hero-buttons">
              <a href="/signup" className="btn btn-primary">Get Started</a>
              <a href="/about" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Our Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Fast Performance</h3>
              <p className="feature-description">
                Lightning-fast performance to keep you productive
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Safe</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3 className="feature-title">Easy to Use</h3>
              <p className="feature-description">
                Intuitive interface designed for everyone
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-text">
              Join thousands of satisfied users today
            </p>
            <a href="/signup" className="btn btn-large">Sign Up Now</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
