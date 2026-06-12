import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './AppRoot';

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                gutter={8}
                toastOptions={{
                    duration: 3500,
                    style: {
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontFamily: 'Inter, sans-serif',
                        padding: '12px 16px',
                        boxShadow: '0 8px 24px -4px rgba(0,0,0,.12)',
                        border: '1px solid rgba(0,0,0,.06)',
                    },
                    success: { iconTheme: { primary: '#00ac81', secondary: '#fff' } },
                    error:   { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>
);
