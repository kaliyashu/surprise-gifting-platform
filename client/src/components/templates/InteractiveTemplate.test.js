import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveTemplate from './InteractiveTemplate';

const sampleTemplate = {
  config: {
    steps: [
      {
        id: 'step1',
        scene: 'TestScene',
        action: 'click',
        content: 'Test Step 1',
        buttonText: 'Next',
      },
      {
        id: 'step2',
        scene: 'TestScene',
        action: 'auto',
        duration: 500,
        content: 'Test Step 2',
      },
    ],
  },
};

describe('InteractiveTemplate', () => {
  it('renders steps and handles click/auto actions', async () => {
    const onComplete = jest.fn();
    render(<InteractiveTemplate template={sampleTemplate} onComplete={onComplete} />);
    // Step 1
    expect(screen.getByText('Test Step 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next'));
    // Step 2 (auto)
    expect(await screen.findByText('Test Step 2')).toBeInTheDocument();
  });
});
