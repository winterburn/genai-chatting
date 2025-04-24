import React from 'react';
import Chatbox from './chatbox';
import './App.css';

function App() {
  return (
    <div className="App" data-testid="app-container">
      <Chatbox />
    </div>
  );
}

export default App;
