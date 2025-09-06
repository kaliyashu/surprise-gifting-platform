import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const MySurprises = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [surprises, setSurprises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurprises();
  }, []);

  const loadSurprises = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to load user's surprises
      setSurprises([]);
    } catch (error) {
      toast.error('Failed to load surprises');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your surprises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Surprises 🎁</h1>
          <button
            onClick={() => navigate('/create')}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Create New Surprise
          </button>
        </div>

        {surprises.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No surprises yet!</h2>
            <p className="text-gray-600 mb-6">
              Start creating amazing surprises for your loved ones
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-pink-500 text-white px-8 py-4 rounded-lg hover:bg-pink-600 transition-colors text-lg"
            >
              Create Your First Surprise
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surprises.map((surprise) => (
              <div key={surprise.id} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{surprise.title}</h3>
                <p className="text-gray-600 mb-4">{surprise.occasion}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/surprise/${surprise.token}`)}
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/edit/${surprise.id}`)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySurprises;
