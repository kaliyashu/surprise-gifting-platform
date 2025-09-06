import React from 'react';

const MyConfettiScene = ({ step, interacted, onInteract }) => (
  <div style={{ padding: 40, textAlign: 'center' }}>
    <h3 style={{ fontSize: 32, color: '#ff69b4' }}>🎊 Confetti Time!</h3>
    <p style={{ margin: '20px 0' }}>Let's celebrate with confetti!</p>
    {!interacted && (
      <button
        style={{ padding: '12px 32px', fontSize: 18, background: 'linear-gradient(90deg,#ffb347,#ff69b4)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        onClick={onInteract}
      >
        Celebrate
      </button>
    )}
    {interacted && <div style={{ marginTop: 20, color: '#4ecdc4', fontWeight: 'bold' }}>🎉 Confetti Launched!</div>}
  </div>
);

export default MyConfettiScene;
