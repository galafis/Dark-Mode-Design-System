import { initThemeController, setTheme, updateToggleButton } from '../src/script.js';

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
    let mockPrefersDark = false;
    let matchMediaListeners = [];
    const createMatchMediaMock = (query) => ({
        matches: mockPrefersDark,
        media: query,
        onchange: null,
        addListener: (handler) => matchMediaListeners.push(handler), // Deprecated, but for compatibility
        removeListener: (handler) => matchMediaListeners = matchMediaListeners.filter(h => h !== handler),
        addEventListener: (event, handler) => { if (event === 'change') matchMediaListeners.push(handler); },
        removeEventListener: (event, handler) => { if (event === 'change') matchMediaListeners = matchMediaListeners.filter(h => h !== handler); },
        dispatchEvent: () => {},
    });
    Object.defineProperty(window, 'matchMedia', { value: createMatchMediaMock });

    // Helper to trigger matchMedia change event
    const triggerMatchMediaChange = (prefersDark) => {
        mockPrefersDark = prefersDark;
        const event = { matches: prefersDark };
        matchMediaListeners.forEach(handler => handler(event));
    };

    // Reset DOM and localStorage before each test
    const resetState = () => {
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
        matchMediaListeners = []; // Clear listeners

        // Ensure the theme-toggle button exists for tests
        let toggleButton = document.getElementById('theme-toggle');
        if (toggleButton) {
            toggleButton.remove(); // Remove existing button to ensure a clean state
        }
        toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.innerHTML = '<span class="theme-icon">🌙</span><span>Tema</span>';
        document.body.appendChild(toggleButton);
    };

    // Test 1: Initial theme should be light if no preference and system prefers light
    test('Initial theme: system light, no stored preference', () => {
        resetState();
        mockPrefersDark = false; // System prefers light
        initThemeController();
        assert(document.documentElement.getAttribute('data-theme') === 'light', 'Initial theme should be light');
        assert(localStorage.getItem('theme') === null, 'Light theme should NOT be saved to localStorage if from system preference');
        assert(document.getElementById('theme-toggle').querySelector('.theme-icon').textContent === '🌙', 'Icon should be moon');
    });

    // Test 2: Initial theme should be dark if no preference and system prefers dark
    test('Initial theme: system dark, no stored preference', () => {
        resetState();
        mockPrefersDark = true; // System prefers dark
        initThemeController();
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Initial theme should be dark');
        assert(localStorage.getItem('theme') === null, 'Dark theme should NOT be saved to localStorage if from system preference');
        assert(document.getElementById('theme-toggle').querySelector('.theme-icon').textContent === '☀️', 'Icon should be sun');
    });

    // Test 3: Theme should load from localStorage if present
    test('Theme loads from localStorage', () => {
        resetState();
        localStorage.setItem('theme', 'dark');
        mockPrefersDark = false; // System prefers light, but localStorage should override
        initThemeController();
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Theme from localStorage should be loaded');
        assert(localStorage.getItem('theme') === 'dark', 'Stored theme should remain in localStorage');
        assert(document.getElementById('theme-toggle').querySelector('.theme-icon').textContent === '☀️', 'Icon should be sun');
    });

    // Test 4: Theme toggle button should switch theme from light to dark
    test('Toggle from light to dark', () => {
        resetState();
        localStorage.setItem('theme', 'light'); // Start with light theme
        initThemeController(); 

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.click(); // Toggle to dark
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Theme should be dark after first click');
        assert(localStorage.getItem('theme') === 'dark', 'localStorage should be dark after first click');
        assert(themeToggle.querySelector('.theme-icon').textContent === '☀️', 'Icon should be sun');
        assert(themeToggle.getAttribute('aria-label') === 'Alternar para modo claro', 'aria-label should be for light mode');
    });

    // Test 5: Theme toggle button should switch theme from dark to light
    test('Toggle from dark to light', () => {
        resetState();
        localStorage.setItem('theme', 'dark'); // Start with dark theme
        initThemeController(); 

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.click(); // Toggle to light
        assert(document.documentElement.getAttribute('data-theme') === 'light', 'Theme should be light after second click');
        assert(localStorage.getItem('theme') === 'light', 'localStorage should be light after second click');
        assert(themeToggle.querySelector('.theme-icon').textContent === '🌙', 'Icon should be moon');
        assert(themeToggle.getAttribute('aria-label') === 'Alternar para modo escuro', 'aria-label should be for dark mode');
    });

    // Test 6: System preference change should update theme if no stored preference
    test('System preference change (no stored preference)', () => {
        resetState();
        localStorage.removeItem('theme'); // Ensure no stored preference
        mockPrefersDark = false; // Initial system preference light
        initThemeController(); 
        assert(document.documentElement.getAttribute('data-theme') === 'light', 'Initial theme should be light based on system');
        assert(localStorage.getItem('theme') === null, 'localStorage should be null initially');

        // Simulate system preference changing to dark
        triggerMatchMediaChange(true);
        assert(document.documentElement.getAttribute('data-theme') === 'dark', 'Theme should switch to dark after system preference change');
        assert(localStorage.getItem('theme') === null, 'localStorage should still be null after system change');
    });

    // Test 7: System preference change should NOT update theme if stored preference exists
    test('System preference change (with stored preference)', () => {
        resetState();
        localStorage.setItem('theme', 'light'); // Stored preference exists
        mockPrefersDark = true; // System prefers dark, but stored preference should override
        initThemeController(); 
        assert(document.documentElement.getAttribute('data-theme') === 'light', 'Theme should remain light due to stored preference');

        // Simulate system preference changing to dark, but stored preference should still override
        triggerMatchMediaChange(true);
        assert(document.documentElement.getAttribute('data-theme') === 'light', 'Theme should still be light, ignoring system preference');
        assert(localStorage.getItem('theme') === 'light', 'localStorage should remain light');
    });
})();
