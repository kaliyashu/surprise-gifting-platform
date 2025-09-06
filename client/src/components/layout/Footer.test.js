

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  });

  it('renders company info and copyright', () => {
    expect(screen.getByText('Surprise Moments')).toBeInTheDocument();
    expect(screen.getByText(/Create unforgettable moments/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('renders all quick links', () => {
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders all support links', () => {
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders all social media buttons and responds to click', () => {
    const facebook = screen.getByText('📘 Facebook');
    const twitter = screen.getByText('🐦 Twitter');
    const instagram = screen.getByText('📷 Instagram');
    expect(facebook).toBeInTheDocument();
    expect(twitter).toBeInTheDocument();
    expect(instagram).toBeInTheDocument();
    fireEvent.click(facebook);
    fireEvent.click(twitter);
    fireEvent.click(instagram);
  });
});
