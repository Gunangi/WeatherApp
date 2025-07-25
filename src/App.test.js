// src/App.test.js

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// A simple test case to check if the main App component renders.
test('renders WeatherNow header link', () => {
    // Render the App component wrapped in BrowserRouter since it uses <Link>
    render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );

    // Find an element that contains the text "WeatherNow"
    const linkElement = screen.getByText(/WeatherNow/i);

    // Assert that the element is present in the document
    expect(linkElement).toBeInTheDocument();
});