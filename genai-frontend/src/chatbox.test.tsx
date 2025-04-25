import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chatbox from './chatbox';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

describe('Chatbox Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders chatbox with initial state', () => {
    render(<Chatbox />);
    
    // Check if the chatbox container is rendered
    expect(screen.getByTestId('chatbox-container')).toBeInTheDocument();
    
    // Check if the input field is present
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    
    // Check if the send button is present
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  test('handles user input correctly', () => {
    render(<Chatbox />);
    
    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    
    expect(input).toHaveValue('Hello, AI!');
  });

  test('sends message when send button is clicked', async () => {
    // Mock the axios post response
    const mockPost = require('axios').post;
    mockPost.mockResolvedValueOnce({
      data: { response: 'AI response' }
    });

    render(<Chatbox />);
    
    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByTestId('send-button');
    
    // Enter message and click send
    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);
    
    // Check if axios was called with correct parameters
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        'http://localhost:8080/answer',
        { prompt: 'Hello, AI!' }
      );
    });
    
    // Check if input is cleared after sending
    expect(input).toHaveValue('');
  });

  test('displays error message when API call fails', async () => {
    // Mock the axios post to reject
    const mockPost = require('axios').post;
    mockPost.mockRejectedValueOnce(new Error('API Error'));

    render(<Chatbox />);
    
    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByTestId('send-button');
    
    // Enter message and click send
    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error sending message/i)).toBeInTheDocument();
    });
  });

  test('displays loading state while waiting for response', async () => {
    // Mock the axios post to delay response
    const mockPost = require('axios').post;
    mockPost.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { response: 'AI response' } }), 100))
    );

    render(<Chatbox />);
    
    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByTestId('send-button');
    
    // Enter message and click send
    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);
    
    // Check if loading state is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Check if input and button are disabled during loading
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    
  });

  test('prevents sending message when Enter is pressed during loading', async () => {
    // Mock the axios post to delay response
    const mockPost = require('axios').post;
    mockPost.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: 'AI response' }), 100))
    );

    render(<Chatbox />);
    
    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByTestId('send-button');
    
    // Enter message and click send
    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);
    
    // Try to send another message while loading
    fireEvent.change(input, { target: { value: 'Another message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Check that the second message wasn't sent
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
}); 
