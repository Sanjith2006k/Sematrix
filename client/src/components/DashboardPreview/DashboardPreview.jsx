import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import Aurora from '../Aurora/Aurora';
import ProgressRing from '../ProgressRing/ProgressRing';
import GlassCard from '../GlassCard/GlassCard';
import './DashboardPreview.css';

const MotionGlassCard = motion(GlassCard);

const DashboardPreview = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.8, // Delay so it appears after the hero section
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Temporary floating animation for cards
  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="dashboard-preview-container">
      <div className="dashboard-aurora-bg">
        <Aurora
          colorStops={["#06B6D4","#B497CF","#37AA9C"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.9}
        />
      </div>
      <div className="dashboard-overlay"></div>
      
      <motion.div 
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Today's Timetable */}
        <MotionGlassCard className="timetable-card" variants={cardVariants} whileHover={{ scale: 1.02 }}>
          <div className="card-title">
            <Calendar size={18} />
            Today's Timetable
          </div>
          <div className="skeleton-item">
            <div className="skeleton-circle" style={{ background: '#37AA9C' }}></div>
            <div className="skeleton-line"></div>
          </div>
          <div className="skeleton-item">
            <div className="skeleton-circle" style={{ background: '#94F3E4' }}></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-item">
            <div className="skeleton-circle" style={{ background: '#B497CF' }}></div>
            <div className="skeleton-line"></div>
          </div>
        </MotionGlassCard>

        {/* Study Progress Ring (Placeholder for Step 3) */}
        <MotionGlassCard 
          className="progress-card" 
          variants={cardVariants}
          animate={floatAnimation}
        >
          <ProgressRing percentage={76} />
        </MotionGlassCard>

        {/* Pomodoro Card */}
        <MotionGlassCard 
          className="pomodoro-card" 
          variants={cardVariants}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-title">
            <Clock size={18} />
            Focus Session
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginTop: '0.5rem' }}>
            25:00
          </div>
        </MotionGlassCard>

        {/* DSA Challenge Card */}
        <MotionGlassCard 
          className="exam-card" 
          variants={cardVariants}
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}
        >
          <div className="card-title" style={{ color: '#06B6D4' }}>
            <BookOpen size={18} />
            Daily DSA
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Two Sum
          </div>
          <div style={{ color: '#B8B8B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            LeetCode • Easy
          </div>
        </MotionGlassCard>

      </motion.div>
    </div>
  );
};

export default DashboardPreview;
