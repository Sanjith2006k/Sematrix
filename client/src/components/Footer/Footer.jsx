import React from 'react';
import { Brain, Code } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Brain size={24} color="#37AA9C" />
            <span>Sematrix</span>
          </div>
          <p className="footer-desc">
            Plan smarter, study better, and achieve more with the ultimate academic ecosystem.
          </p>
        </div>
        
        <div className="footer-links">
          <a href="https://github.com/Sanjith2006k" target="_blank" rel="noopener noreferrer" className="footer-github">
            <Code size={20} />
            <span>Built by @Sanjith </span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Sematrix. All rights reserved.</p>
      </div>
    </footer>
  );
}
