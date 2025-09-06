import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import InteractiveTemplate from '../components/templates/InteractiveTemplate';

const ViewSurprise = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [surprise, setSurprise] = useState(null);
  const [template, setTemplate] = useState(null);
  const [currentRevelation, setCurrentRevelation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInteractive, setShowInteractive] = useState(false);

  useEffect(() => {
    loadSurprise();
  }, [token]);

  const loadSurprise = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surprises/view/${token}`);
      setSurprise(response.data);
      
      // Load template if available
      if (response.data.template_id) {
        try {
          const templateResponse = await axios.get(`/api/templates/${response.data.template_id}`);
          setTemplate(templateResponse.data);
          
          // Check if it's an interactive template
          if (templateResponse.data.interactive) {
            setShowInteractive(true);
          }
        } catch (templateError) {
          console.error('Error loading template:', templateError);
        }
      }
      
      // Check if surprise requires password
      if (response.data.password && !isUnlocked) {
        setShowPassword(true);
      } else {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error('Error loading surprise:', error);
      toast.error('Failed to load surprise');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await axios.post(`/api/surprises/${surprise.id}/unlock`, {
        password: password
      });
      
      if (response.data.success) {
        setIsUnlocked(true);
        setShowPassword(false);
        toast.success('Surprise unlocked!');
      }
    } catch (error) {
      toast.error('Incorrect password');
    }
  };

  const nextRevelation = () => {
    if (currentRevelation < surprise.revelations.length - 1) {
      setCurrentRevelation(currentRevelation + 1);
    }
  };

  const previousRevelation = () => {
    if (currentRevelation > 0) {
      setCurrentRevelation(currentRevelation - 1);
    }
  };

  const shareSurprise = async () => {
    try {
      const shareUrl = `${window.location.origin}/surprise/${token}`;
      await navigator.share({
        title: surprise.title,
        text: `Check out this amazing surprise: ${surprise.title}`,
        url: shareUrl
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/surprise/${token}`);
      toast.success('Surprise link copied to clipboard!');
    }
  };

  const renderRevelation = (revelation) => {
    switch (revelation.type) {
      case 'message':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <p className="text-2xl text-center text-gray-800 leading-relaxed">
              {revelation.content}
            </p>
          </div>
        );
      case 'image':
        return (
          <div className="w-full flex justify-center">
            <img
              src={revelation.content}
              alt="Surprise content"
              className="max-w-full h-auto rounded-2xl shadow-lg"
              style={{ maxHeight: '400px' }}
            />
          </div>
        );
      case 'video':
        return (
          <div className="w-full flex justify-center">
            <video
              src={revelation.content}
              controls
              className="max-w-full h-auto rounded-2xl shadow-lg"
              style={{ maxHeight: '400px' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      case 'animation':
        return (
          <div className="w-full flex justify-center">
            <div className="w-64 h-64">
              {/* You can integrate Lottie or other animation libraries here */}
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl">🎉</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading surprise...</p>
        </div>
      </div>
    );
  }

  // Show interactive template if available and unlocked
  if (showInteractive && template && isUnlocked) {
    return (
      <InteractiveTemplate
        template={template}
        surprise={surprise}
        onComplete={() => setShowInteractive(false)}
      />
    );
  }

  if (!surprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Surprise Not Found</h1>
          <p className="text-gray-600 mb-6">This surprise may have been removed or the link is invalid.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isUnlocked && surprise.password) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Surprise Locked</h1>
          <p className="text-gray-600 mb-6">
            Enter the password to unlock this surprise
          </p>
          
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <button
              onClick={handlePasswordSubmit}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              🔓
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRev = surprise.revelations[currentRevelation];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">{surprise.title}</h1>
            <p className="text-sm text-gray-600">{surprise.occasion}</p>
          </div>
          
          <button
            onClick={shareSurprise}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Share surprise"
          >
            📤
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentRevelation + 1) / surprise.revelations.length) * 100}%`
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {currentRevelation + 1} of {surprise.revelations.length}
          </p>
        </div>
      </div>

      {/* Revelation Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="min-h-96 flex items-center justify-center">
            {renderRevelation(currentRev)}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={previousRevelation}
              disabled={currentRevelation === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentRevelation === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {surprise.revelations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentRevelation(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentRevelation
                      ? 'bg-pink-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextRevelation}
              disabled={currentRevelation === surprise.revelations.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentRevelation === surprise.revelations.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSurprise;
