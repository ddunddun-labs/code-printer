import React from 'react';

const AdComponent = ({ className }) => {
  const adStyle = {
    width: '100%',
    minHeight: '90px',
    backgroundColor: '#f0f2f5',
    borderTop: '1px solid #d1d5da',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '14px',
    color: '#586069',
    boxSizing: 'border-box',
  };

  return (
    <div className={`ad-component ${className || ''}`} style={adStyle}>
      <p>광고 영역 (Ad Placeholder)</p>
    </div>
  );
};

export default AdComponent;
