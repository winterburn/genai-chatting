import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  test('renders the main App component', () => {
    render(<App />);
    
    // Check if the App container is rendered
    expect(screen.getByTestId('app-container')).toBeInTheDocument();
    
    // Check if the Chatbox component is rendered
    expect(screen.getByTestId('chatbox-container')).toBeInTheDocument();
  });
});
