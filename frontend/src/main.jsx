import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App.jsx'

// Polyfill findDOMNode for React 19 compatibility with react-quill
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (el) => {
    if (!el) return null;
    return el instanceof HTMLElement ? el : (el.el || null);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
