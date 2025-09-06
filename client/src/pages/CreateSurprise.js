import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TemplateSelector from '../components/templates/TemplateSelector';

const CreateSurprise = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('template'); // 'template', 'details', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    occasion: '',
    recipient: '',
    message: '',
    password: '',
    hasPassword: false,
    templateId: '',
    interactive: false
  });
  const [loading, setLoading] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      interactive: template.interactive,
      occasion: template.category
    }));
    setStep('details');
  };

  const handleBackToTemplates = () => {
    setStep('template');
    setSelectedTemplate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to create surprise
      toast.success('Surprise created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create surprise');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Render template selection step
  if (step === 'template') {
    return (
      <TemplateSelector
        onTemplateSelect={handleTemplateSelect}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  // Render details form step
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Create a New Surprise 🎉
            </h1>
            <button
              onClick={handleBackToTemplates}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Choose Different Template
            </button>
          </div>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedTemplate.category}
                    </span>
                    {selectedTemplate.interactive && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        🎮 Interactive
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-6xl">
                  {selectedTemplate.interactive ? '🎮' : '🎨'}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surprise Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., Birthday Surprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Select occasion</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="wedding">Wedding</option>
                  <option value="graduation">Graduation</option>
                  <option value="holiday">Holiday</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Who is this surprise for?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Write a personal message for the recipient..."
              />
            </div>

            {/* Password Protection */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="hasPassword"
                  checked={formData.hasPassword}
                  onChange={handleChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Protect this surprise with a password
                </label>
              </div>

              {formData.hasPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Enter a password to protect this surprise"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Recipients will need this password to view the surprise
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Surprise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSurprise;
