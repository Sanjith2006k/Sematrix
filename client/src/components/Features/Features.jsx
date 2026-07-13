import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BrainCircuit, Headphones, Code2 } from 'lucide-react';
import './Features.css';

const featuresData = [
  {
    icon: <Calendar size={28} />,
    title: 'Smart Timetables',
    description: 'Our intelligent engine generates a perfect, personalized study schedule adapted to your learning speed and exam dates.'
  },
  {
    icon: <Headphones size={28} />,
    title: 'Immersive Focus Mode',
    description: 'A customizable drum-roll timer synced with live curated Lofi radio streams to keep you deeply focused without distractions.'
  },
  {
    icon: <Code2 size={28} />,
    title: 'Integrated DSA Lab',
    description: 'Browse, solve, and track over 3000 LeetCode problems directly from your dashboard with built-in rich note-taking.'
  },
  {
    icon: <BrainCircuit size={28} />,
    title: 'Smart Progress Tracking',
    description: 'Visualize your daily goals and topic mastery using dynamic progress rings and actionable analytics.'
  }
];

export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <motion.div 
          className="features-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="features-title">Everything you need to succeed</h2>
          <p className="features-subtitle">
            Sematrix brings your schedule, coding practice, and deep-focus tools into one beautiful ecosystem.
          </p>
        </motion.div>

        <div className="features-grid">
          {featuresData.map((feature, idx) => (
            <motion.div 
              key={idx}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
