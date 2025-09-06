import React from 'react';
import { render } from '@testing-library/react';
import TemplateSelector from './TemplateSelector';

describe('TemplateSelector', () => {
  it('renders without crashing', () => {
    render(<TemplateSelector />);
  });
});
