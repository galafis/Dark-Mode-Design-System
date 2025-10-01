(function() {
    'use strict';

    const assert = (condition, message) => {
        if (!condition) {
            throw new Error(message || "Assertion failed");
        }
    };

    const test = (name, fn) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'test-result';
        resultDiv.innerHTML = `<strong>${name}:</strong> <span class="status"></span>`;
        document.getElementById('test-results').appendChild(resultDiv);

        try {
            fn();
            resultDiv.classList.add('pass');
            resultDiv.querySelector('.status').textContent = 'PASS';
        } catch (e) {
            resultDiv.classList.add('fail');
            resultDiv.querySelector('.status').textContent = `FAIL - ${e.message}`;
            console.error(`Test Failed: ${name}`, e);
        }
    };

    // Mock localStorage
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: function(key) { return store[key] || null; },
            setItem: function(key, value) { store[key] = value.toString(); },
            removeItem: function(key) { delete store[key]; },
            clear: function() { store = {}; }
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock matchMedia
    let mockMatches = false;
    const matchMediaMock = (query) => ({
        matches: mockMatches,
        media: query,
        onchange: null,
        addListener: () => {}, // Mock function
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
    });
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });

    // Reset DOM before each test
    const resetDOM = () => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
        // Clear any existing toggle button to avoid interference
        const existingToggleButton = document.getElementById('theme-toggle');
        if (existingToggleButton) {
            existingToggleButton.remove();
        }
    };

    // Ensure ThemeController is available globally after script.js loads
    // For these tests, we assume script.js is loaded *before* script.test.js
    const ThemeController = window.ThemeController;

    // Helper to simulate a fresh load of ThemeController for tests that need it
    const simulateFreshLoad = () => {
        // This is a simplified approach. In a real test runner, you'd re-import/re-require the module.
        // Here, we'll just re-run the initTheme and setupEventListeners manually.
        // This assumes initTheme and setupEventListeners are idempotent or can be safely re-run.
        ThemeController.initTheme();
        // Re-attach event listeners, especially for keyboard shortcuts
        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.innerHTML = '<span class="theme-icon">🌙</span><span>Tema</span>';
        document.body.appendChild(toggleButton);
        ThemeController.setupEventListeners();
    };

    test('ThemeController.getSystemTheme should return dark if system prefers dark', () => {
        resetDOM();
        mockMatches = true;
        simulateFreshLoad();
        assert(ThemeController.getSystemTheme() === 'dark', 'System theme should be dark');
    });

    test('ThemeController.getSystemTheme should return light if system prefers light', () => {
        resetDOM();
        mockMatches = false;
        simulateFreshLoad();
        assert(ThemeController.getSystemTheme() === 'light', 'System theme should be light');
    });

    test('ThemeController.set should apply the theme to documentElement', () => {
        resetDOM();
        simulateFreshLoad();
        ThemeController.set('dark');
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'data-theme should be dark');
        ThemeController.set('light');
        assert(document.documentElement.getAttribute('data-theme') === null, 'data-theme should be removed for light');
    });

    test('ThemeController.toggle should switch theme and save to localStorage', () => {
        resetDOM();
        simulateFreshLoad();
        // Initial state (default is light)
        ThemeController.set('light'); // Ensure a known starting state
        assert(ThemeController.get() === 'light', 'Initial theme should be light');

        // Toggle to dark
        ThemeController.toggle();
        assert(ThemeController.get() === 'dark', 'Theme should be dark after first toggle');
        assert(localStorage.getItem('theme') === 'dark', 'localStorage should save dark theme');

        // Toggle to light
        ThemeController.toggle();
        assert(ThemeController.get() === 'light', 'Theme should be light after second toggle');
        assert(localStorage.getItem('theme') === 'light', 'localStorage should save light theme');
    });

    test('ThemeController should load saved theme from localStorage on init', () => {
        resetDOM();
        localStorage.setItem('theme', 'dark');
        simulateFreshLoad();
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Saved theme should be loaded');
        assert(ThemeController.get() === 'dark', 'ThemeController.get should reflect saved theme');
    });

    test('ThemeController should respect system preference if no theme is saved', () => {
        resetDOM();
        localStorage.removeItem('theme');
        mockMatches = true; // System prefers dark
        simulateFreshLoad();
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Should use system dark preference');

        resetDOM();
        localStorage.removeItem('theme');
        mockMatches = false; // System prefers light
        simulateFreshLoad();
        assert(document.documentElement.getAttribute('data-theme') === null, 'Should use system light preference (no data-theme)');
    });

    test('updateToggleButton should update aria-label and icon', () => {
        resetDOM();
        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.innerHTML = '<span class="theme-icon">🌙</span><span>Tema</span>';
        document.body.appendChild(toggleButton);
        simulateFreshLoad();

        ThemeController.set('dark');
        assert(toggleButton.getAttribute('aria-label') === 'Alternar para modo claro', 'aria-label should be for light mode');
        assert(toggleButton.querySelector('.theme-icon').textContent === '☀️', 'Icon should be sun');

        ThemeController.set('light');
        assert(toggleButton.getAttribute('aria-label') === 'Alternar para modo escuro', 'aria-label should be for dark mode');
        assert(toggleButton.querySelector('.theme-icon').textContent === '🌙', 'Icon should be moon');

        document.body.removeChild(toggleButton);
    });

    test('Keyboard shortcut Ctrl+Shift+D should toggle theme', () => {
        resetDOM();
        // Simulate button presence for updateToggleButton
        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.innerHTML = '<span class="theme-icon">🌙</span><span>Tema</span>';
        document.body.appendChild(toggleButton);
        simulateFreshLoad();

        // Initial theme is light
        ThemeController.set('light');
        assert(ThemeController.get() === 'light', 'Initial theme should be light');

        // Simulate Ctrl+Shift+D
        const event = new KeyboardEvent('keydown', {
            key: 'D',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true
        });
        document.dispatchEvent(event);
        assert(ThemeController.get() === 'dark', 'Theme should be dark after shortcut');

        document.dispatchEvent(event);
        assert(ThemeController.get() === 'light', 'Theme should be light after second shortcut');

        document.body.removeChild(toggleButton);
    });

    // Run tests after the DOM is fully loaded
    window.addEventListener('DOMContentLoaded', () => {
        document.getElementById('test-results').innerHTML = ''; // Clear previous results if any
        // Ensure ThemeController is initialized before running tests
        if (window.ThemeController && window.ThemeController.initTheme) {
            window.ThemeController.initTheme();
        }
        if (window.ThemeController && window.ThemeController.setupEventListeners) {
            window.ThemeController.setupEventListeners();
        }
        // Now run the tests
        test('All tests completed', () => {}); // Placeholder to show all tests ran
    });

})();
