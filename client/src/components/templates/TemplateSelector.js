import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveTemplate from './InteractiveTemplate';

const TemplateSelector = ({ onTemplateSelect, selectedTemplate, onBack }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallback to default templates
      setTemplates([
        {
          id: 'golden-door-birthday',
          name: 'Golden Door Birthday',
          description: 'Interactive gamified birthday surprise with door opening, lights, and balloon popping',
          category: 'birthday',
          interactive: true,
          config: {
            backgroundColor: '#1a1a1a',
            textColor: '#FFFFFF',
            type: 'gamified',
            steps: [
              {
                id: 'door',
                scene: 'DarkRoom',
                action: 'click',
                effect: 'openDoor',
                next: 'lights',
                audio: 'door-creak.mp3',
                background: 'dark-room.jpg'
              },
              {
                id: 'lights',
                scene: 'LightReveal',
                action: 'auto',
                effect: 'turnOnLights',
                next: 'balloons',
                audio: 'birthday-music.mp3',
                background: 'bright-room.jpg',
                decorations: ['balloons', 'ribbons', 'confetti']
              },
              {
                id: 'balloons',
                scene: 'BalloonInteraction',
                action: 'clickMultiple',
                effect: 'popBalloon',
                reveals: ['messages', 'media'],
                next: 'final',
                audio: 'balloon-pop.mp3',
                count: 5
              },
              {
                id: 'final',
                scene: 'FinalReveal',
                action: 'auto',
                effect: 'showFinalMessage',
                content: 'Happy Birthday 🎂',
                audio: 'celebration.mp3',
                effects: ['fireworks', 'confetti-burst']
              }
            ]
          }
        },
        {
          id: 'classic-birthday',
          name: 'Classic Birthday',
          description: 'Traditional birthday celebration with balloons and confetti',
          category: 'birthday',
          interactive: false,
          config: {
            backgroundColor: '#FF6B6B',
            textColor: '#FFFFFF',
            animation: 'birthday-celebration',
            duration: 5000,
            effects: ['confetti', 'balloons', 'sparkles']
          }
        },
        {
          id: 'romantic-love',
          name: 'Romantic Love',
          description: 'A romantic template perfect for anniversaries and love letters',
          category: 'love',
          interactive: false,
          config: {
            backgroundColor: '#FF69B4',
            textColor: '#FFFFFF',
            animation: 'romantic-hearts',
            duration: 4000,
            effects: ['hearts', 'rose-petals', 'glow']
          }
        },
        {
          id: 'anniversary-elegance',
          name: 'Anniversary Elegance',
          description: 'An elegant template for wedding anniversaries',
          category: 'anniversary',
          interactive: false,
          config: {
            backgroundColor: '#9370DB',
            textColor: '#FFFFFF',
            animation: 'elegant-reveal',
            duration: 6000,
            effects: ['elegant-transition', 'gold-sparkles', 'fade-in']
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: '🎨' },
    { id: 'birthday', name: 'Birthday', icon: '🎂' },
    { id: 'love', name: 'Love & Romance', icon: '❤️' },
    { id: 'anniversary', name: 'Anniversary', icon: '💍' },
    { id: 'friendship', name: 'Friendship', icon: '👯' },
    { id: 'graduation', name: 'Graduation', icon: '🎓' },
    { id: 'interactive', name: 'Interactive', icon: '🎮' }
  ];

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'interactive') return template.interactive;
    return template.category === selectedCategory;
  });

  const handleTemplateSelect = (template) => {
    onTemplateSelect(template);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Choose Your Surprise Template 🎁
            </h1>
            <p className="text-xl text-gray-600">
              Select from our collection of beautiful templates
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
                {template.interactive ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <div className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full">
                      Interactive
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {template.category === 'birthday' && '🎂'}
                      {template.category === 'love' && '❤️'}
                      {template.category === 'anniversary' && '💍'}
                      {template.category === 'friendship' && '👯'}
                      {template.category === 'graduation' && '🎓'}
                    </div>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                    {template.category}
                  </span>
                </div>

                {/* Interactive Badge */}
                {template.interactive && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md animate-pulse">
                      🎮 Interactive
                    </span>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Template Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.interactive ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      🎯 Multi-step
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      🎬 Single reveal
                    </span>
                  )}
                  
                  {template.config.effects && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                      ✨ {template.config.effects.length} effects
                    </span>
                  )}
                </div>

                {/* Select Button */}
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105">
                  {template.interactive ? '🎮 Use Interactive Template' : '🎨 Use Template'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Templates Message */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No templates found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later for new templates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
