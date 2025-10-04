/**
 * Dark-Mode-Design-System - Theme Controller Script
 * Manages dark mode toggle and persistence.
 * Author: Gabriel Demetrios Lafis
 */

const htmlElement = document.documentElement;

// Function to update the toggle button icon and aria-label
export const updateToggleButton = (theme, toggleButton) => {
    if (toggleButton) { 
        const themeIcon = toggleButton.querySelector(".theme-icon");
        if (theme === "dark") {
            if (themeIcon) themeIcon.textContent = "☀️";
            toggleButton.setAttribute("aria-label", "Alternar para modo claro");
        } else {
            if (themeIcon) themeIcon.textContent = "🌙";
            toggleButton.setAttribute("aria-label", "Alternar para modo escuro");
        }
    }
};

// Function to set the theme
export const setTheme = (theme, toggleButton, saveToLocalStorage = true) => {
    htmlElement.setAttribute("data-theme", theme);
    if (saveToLocalStorage) {
        localStorage.setItem("theme", theme);
    }
    updateToggleButton(theme, toggleButton);
};

// Initialization function
export const initThemeController = () => {
    const themeToggle = document.getElementById("theme-toggle");

    // Get stored theme or detect system preference
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    if (storedTheme) {
        setTheme(storedTheme, themeToggle);
    } else if (prefersDark.matches) {
        setTheme("dark", themeToggle, false); // Do not save to localStorage if it's just system preference
    } else {
        setTheme("light", themeToggle, false); // Do not save to localStorage if it's just system preference
    }

    // Listen for system theme changes
    prefersDark.addEventListener("change", (event) => {
        if (!localStorage.getItem("theme")) { // Only change if user hasn\"t manually set a theme
            setTheme(event.matches ? "dark" : "light", themeToggle, false); // Do not save to localStorage
        }
    });

    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            setTheme(newTheme, themeToggle);
        });
    }
};
