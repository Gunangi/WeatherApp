// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AppProvider } from './context/AppContext'; // We will create this context

function App() {
    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </AppProvider>
    );
}

export default App;