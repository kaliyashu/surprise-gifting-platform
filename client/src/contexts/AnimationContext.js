import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  const [animations, setAnimations] = useState({
    video: [],
    cursor: [],
    templates: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnimations();
  }, []);

  const loadAnimations = async () => {
    try {
      setLoading(true);
      
      // Load video animations
      const videoResponse = await fetch('/api/assets/videos');
      const videoData = await videoResponse.json();
      
      // Load cursor animations
      const cursorResponse = await fetch('/api/assets/cursor');
      const cursorData = await cursorResponse.json();
      
      // Load templates
      const templatesResponse = await fetch('/api/assets/templates');
      const templatesData = await templatesResponse.json();

      setAnimations({
        video: videoData.data || [],
        cursor: cursorData.data || [],
        templates: templatesData.data || []
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load animations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVideoAnimation = (id) => {
    return animations.video.find(anim => anim.name === id);
  };

  const getCursorAnimation = (id) => {
    return animations.cursor.find(anim => anim.name === id);
  };

  const getTemplate = (id) => {
    return animations.templates.find(template => template.name === id);
  };

  const refreshAnimations = () => {
    loadAnimations();
  };

  const value = {
    animations,
    loading,
    error,
    getVideoAnimation,
    getCursorAnimation,
    getTemplate,
    refreshAnimations
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

