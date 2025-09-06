const { query } = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up Surprise Moments database...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        verification_expiry TIMESTAMP,
        reset_token VARCHAR(255),
        reset_expiry TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Users table created');

    // Create templates table
    await query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        config JSONB NOT NULL,
        interactive BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Templates table created');

    // Create surprises table
    await query(`
      CREATE TABLE IF NOT EXISTS surprises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        occasion VARCHAR(50) NOT NULL,
        template_id UUID REFERENCES templates(id),
        revelations JSONB NOT NULL,
        password_hash VARCHAR(255),
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP,
        is_public BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Surprises table created');

    // Create surprise_views table for analytics
    await query(`
      CREATE TABLE IF NOT EXISTS surprise_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        surprise_id UUID REFERENCES surprises(id) ON DELETE CASCADE,
        viewer_ip INET,
        user_agent TEXT,
        viewed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Surprise views table created');

    // Create media_files table
    await query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        path VARCHAR(500) NOT NULL,
        is_processed BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Media files table created');

    // Create animations table
    await query(`
      CREATE TABLE IF NOT EXISTS animations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        config JSONB NOT NULL,
        audio_url VARCHAR(500),
        duration INTEGER DEFAULT 5000,
        is_active BOOLEAN DEFAULT true,
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Animations table created');

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await query('CREATE INDEX IF NOT EXISTS idx_surprises_user_id ON surprises(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_surprises_token_hash ON surprises(token_hash)');
    await query('CREATE INDEX IF NOT EXISTS idx_surprises_created_at ON surprises(created_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_animations_category ON animations(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_surprise_views_surprise_id ON surprise_views(surprise_id)');
    console.log('✅ Database indexes created');

    // Insert default templates
    const defaultTemplates = [
      {
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
        name: 'Birthday Celebration',
        description: 'A festive birthday template with balloons and confetti',
        category: 'birthday',
        config: {
          backgroundColor: '#FF6B6B',
          textColor: '#FFFFFF',
          animation: 'birthday-celebration',
          duration: 5000,
          effects: ['confetti', 'balloons', 'sparkles']
        }
      },
      {
        name: 'Romantic Love',
        description: 'A romantic template perfect for anniversaries and love letters',
        category: 'love',
        config: {
          backgroundColor: '#FF69B4',
          textColor: '#FFFFFF',
          animation: 'romantic-hearts',
          duration: 4000,
          effects: ['hearts', 'rose-petals', 'glow']
        }
      },
      {
        name: 'Anniversary Elegance',
        description: 'An elegant template for wedding anniversaries',
        category: 'anniversary',
        config: {
          backgroundColor: '#9370DB',
          textColor: '#FFFFFF',
          animation: 'elegant-reveal',
          duration: 6000,
          effects: ['elegant-transition', 'gold-sparkles', 'fade-in']
        }
      },
      {
        name: 'Friendship Fun',
        description: 'A fun and playful template for friendship surprises',
        category: 'friendship',
        config: {
          backgroundColor: '#4ECDC4',
          textColor: '#FFFFFF',
          animation: 'friendship-fun',
          duration: 3500,
          effects: ['bubbles', 'rainbow-trails', 'bounce']
        }
      },
      {
        name: 'Graduation Achievement',
        description: 'A celebratory template for graduation milestones',
        category: 'graduation',
        config: {
          backgroundColor: '#FFD700',
          textColor: '#000000',
          animation: 'graduation-celebration',
          duration: 4500,
          effects: ['graduation-caps', 'confetti', 'achievement-glow']
        }
      }
    ];

    for (const template of defaultTemplates) {
      await query(
        `INSERT INTO templates (name, description, category, config)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [template.name, template.description, template.category, JSON.stringify(template.config)]
      );
    }
    console.log('✅ Default templates inserted');

    // Insert default animations
    const defaultAnimations = [
      {
        name: 'golden-door-open',
        description: 'Interactive golden door opening animation',
        category: 'interactive',
        config: {
          type: 'framer-motion',
          variants: 'door-open-variants',
          interaction: 'click',
          sound: 'door-creak.mp3'
        },
        duration: 2000
      },
      {
        name: 'light-reveal',
        description: 'Smooth light reveal with room illumination',
        category: 'interactive',
        config: {
          type: 'framer-motion',
          variants: 'light-reveal-variants',
          interaction: 'auto',
          sound: 'birthday-music.mp3'
        },
        duration: 3000
      },
      {
        name: 'balloon-pop',
        description: 'Balloon popping with confetti burst',
        category: 'interactive',
        config: {
          type: 'framer-motion',
          variants: 'balloon-pop-variants',
          interaction: 'click',
          sound: 'balloon-pop.mp3'
        },
        duration: 1000
      },
      {
        name: 'celebration-finale',
        description: 'Final celebration with fireworks and confetti',
        category: 'interactive',
        config: {
          type: 'framer-motion',
          variants: 'celebration-variants',
          interaction: 'auto',
          sound: 'celebration.mp3'
        },
        duration: 5000
      },
      {
        name: 'birthday-celebration',
        description: 'Festive birthday animation with balloons and confetti',
        category: 'birthday',
        config: {
          type: 'lottie',
          file: 'birthday-celebration.json',
          loop: false,
          autoplay: true
        },
        duration: 5000
      },
      {
        name: 'romantic-hearts',
        description: 'Romantic animation with floating hearts',
        category: 'love',
        config: {
          type: 'gsap',
          timeline: 'romantic-hearts-timeline',
          loop: false,
          autoplay: true
        },
        duration: 4000
      },
      {
        name: 'elegant-reveal',
        description: 'Elegant reveal animation with smooth transitions',
        category: 'anniversary',
        config: {
          type: 'css',
          keyframes: 'elegant-reveal-keyframes',
          loop: false,
          autoplay: true
        },
        duration: 6000
      },
      {
        name: 'friendship-fun',
        description: 'Fun and playful animation with bubbles',
        category: 'friendship',
        config: {
          type: 'threejs',
          scene: 'friendship-bubbles',
          loop: false,
          autoplay: true
        },
        duration: 3500
      },
      {
        name: 'graduation-celebration',
        description: 'Celebratory graduation animation',
        category: 'graduation',
        config: {
          type: 'lottie',
          file: 'graduation-celebration.json',
          loop: false,
          autoplay: true
        },
        duration: 4500
      }
    ];

    for (const animation of defaultAnimations) {
      await query(
        `INSERT INTO animations (name, description, category, config, duration)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING`,
        [animation.name, animation.description, animation.category, JSON.stringify(animation.config), animation.duration]
      );
    }
    console.log('✅ Default animations inserted');

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Tables created: users, templates, surprises, surprise_views, media_files, animations');
    console.log('🔗 You can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
