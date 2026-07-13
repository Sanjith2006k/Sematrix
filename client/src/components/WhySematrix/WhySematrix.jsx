import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import './WhySematrix.css';

const benefits = [
  "Consolidate your study apps into one clean dashboard",
  "Stay accountable with dynamic visual progress rings",
  "Never miss a study session with intelligent timetables",
  "Reduce test anxiety by following a structured, personalized path",
  "Boost deep work intervals with the built-in Lofi focus timer",
  "Directly tackle DSA problems and keep all your notes organized"
];

export default function WhySematrix() {
  return (
    <section id="why" className="why-section">
      <div className="why-container">
        <div className="why-content">
          <motion.div 
            className="why-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="why-title">Why choose Sematrix?</h2>
            <p className="why-subtitle">
              Most productivity apps scatter your attention across multiple tabs—a timer here, a calendar there, and a coding platform somewhere else. Sematrix unifies everything required for academic and interview success into a single, beautifully designed ecosystem.
            </p>
            <ul className="why-list">
              {benefits.map((benefit, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <CheckCircle size={20} className="why-check" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            className="why-image-wrapper"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="why-glow-blob" />
            <div className="why-glass-panel">
              <div className="why-stat">
                <span className="why-stat-num">3x</span>
                <span className="why-stat-desc">Faster problem solving and retention</span>
              </div>
              <div className="why-stat">
                <span className="why-stat-num">100%</span>
                <span className="why-stat-desc">Focus during immersive Lofi sessions</span>
              </div>
              <div className="why-stat">
                <span className="why-stat-num">0</span>
                <span className="why-stat-desc">Distractions from context switching</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
