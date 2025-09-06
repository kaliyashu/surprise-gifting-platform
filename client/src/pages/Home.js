import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  FaHeart, 
  FaGift, 
  FaUsers, 
  FaShieldAlt, 
  FaPlay, 
  FaArrowRight,
  FaBirthdayCake,
  FaRing,
  FaGraduationCap,
  FaSmile
} from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaHeart className="text-4xl text-pink-500" />,
      title: 'Personalized Surprises',
      description: 'Create unique, personalized surprise experiences for your loved ones with custom messages, images, and animations.'
    },
    {
      icon: <FaGift className="text-4xl text-purple-500" />,
      title: 'Beautiful Animations',
      description: 'Choose from a variety of stunning animations and templates to make your surprises truly magical and memorable.'
    },
    {
      icon: <FaUsers className="text-4xl text-blue-500" />,
      title: 'Easy Sharing',
      description: 'Generate unique links to share your surprises instantly. No downloads or installations required.'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-500" />,
      title: 'Secure & Private',
      description: 'Your surprises are protected with encryption and optional password protection for complete privacy.'
    }
  ];

  const occasions = [
    {
      icon: <FaBirthdayCake className="text-3xl" />,
      title: 'Birthdays',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: <FaRing className="text-3xl" />,
      title: 'Anniversaries',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <FaHeart className="text-3xl" />,
      title: 'Love Letters',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: <FaGraduationCap className="text-3xl" />,
      title: 'Graduations',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <FaSmile className="text-3xl" />,
      title: 'Friendship',
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Surprise Moments - Create Magical Surprises for Your Loved Ones</title>
        <meta name="description" content="Create personalized surprise experiences with beautiful animations, custom messages, and easy sharing. Perfect for birthdays, anniversaries, and special moments." />
        <meta name="keywords" content="surprise, gifting, animations, personalized, birthday, anniversary, love" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Create Magical
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Surprise Moments
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-100"
          >
            Transform your special occasions into unforgettable experiences with personalized animations, 
            custom messages, and beautiful reveals that will make hearts skip a beat.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/create"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FaGift />
              Create Your First Surprise
              <FaArrowRight />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors duration-300 flex items-center justify-center gap-2">
              <FaPlay />
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose Surprise Moments?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the perfect platform to help you create meaningful, 
              beautiful surprises that will be remembered forever.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Perfect for Every Occasion
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From birthdays to anniversaries, create the perfect surprise for any special moment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {occasions.map((occasion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${occasion.color} p-6 rounded-xl text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
              >
                <div className="mb-3 flex justify-center">
                  {occasion.icon}
                </div>
                <h3 className="font-semibold text-lg">
                  {occasion.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Magic?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of people who are already creating unforgettable surprise moments for their loved ones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/templates"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors duration-300"
              >
                Browse Templates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
