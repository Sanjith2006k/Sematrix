import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  onClick, 
  type = 'button',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  const finalClass = `${baseClass} ${variantClass} ${className}`;

  return (
    <motion.button
      type={type}
      className={finalClass}
      onClick={onClick}
      disabled={isLoading || props.disabled}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="btn-loading-spinner"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
