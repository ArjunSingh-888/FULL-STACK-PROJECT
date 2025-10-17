import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-heading">About Us</h3>
          <p className="footer-text">
            We are dedicated to providing the best service to our customers.
          </p>
        </div>
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 className="footer-heading">Contact</h3>
          <p className="footer-text">Email: info@FriendZone.com</p>
          <p className="footer-text">Phone: +1 234 567 8900</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 MyApp. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
