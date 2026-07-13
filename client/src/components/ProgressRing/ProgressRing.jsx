import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ProgressRing.css';

const ProgressRing = ({ percentage = 76 }) => {
  const [offset, setOffset] = useState(0);
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const progressOffset = circumference - (percentage / 100) * circumference;
    setOffset(progressOffset);
  }, [percentage, circumference]);

  return (
    <div className="progress-ring-container">
      <svg
        className="progress-ring"
        width={size}
        height={size}
      >
        <circle
          className="progress-ring-circle-bg"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="progress-ring-circle"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
        />
      </svg>
      <div className="progress-ring-content">
        <motion.span 
          className="progress-ring-value"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          {percentage}%
        </motion.span>
        <motion.span 
          className="progress-ring-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.7 }}
        >
          Today's Goal
        </motion.span>
      </div>
    </div>
  );
};

export default ProgressRing;
