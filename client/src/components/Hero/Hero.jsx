import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardPreview from '../DashboardPreview/DashboardPreview';
import Button from '../Button/Button';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="hero-container">
      <motion.div 
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-badges" variants={itemVariants}>
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Smart Planning</span>
          </div>
          <div className="hero-badge">
            <Zap size={14} />
            <span>Free Forever</span>
          </div>
          <div className="hero-badge">
            <Target size={14} />
            <span>Personalized Learning</span>
          </div>
        </motion.div>

        <motion.h1 className="hero-title" variants={itemVariants}>
          Plan Smarter. <br />
          Study Better. <br />
          Achieve <span className="gradient-text">More.</span>
        </motion.h1>

        <motion.p className="hero-subtitle" variants={itemVariants}>
          Experience the next generation of study planning. Sematrix crafts personalized timetables, tracks your progress, and optimizes your learning journey like never before.
        </motion.p>

        <motion.div className="hero-buttons" variants={itemVariants}>
          <Button variant="primary" onClick={() => navigate('/register')}>
            Get Started
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Features
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="hero-visuals"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      >
        <DashboardPreview />
      </motion.div>
    </section>
  );
};

export default Hero;
