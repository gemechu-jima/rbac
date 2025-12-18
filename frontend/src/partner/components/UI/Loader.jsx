import React from 'react';
import './Loader.css';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-message">{message}</p>
      </div>
    </div>
  );
};

export const InlineLoader = ({ size = 'small' }) => {
  return (
    <div className={`inline-loader inline-loader-${size}`}>
      <div className="loader-spinner"></div>
    </div>
  );
};

export default Loader;