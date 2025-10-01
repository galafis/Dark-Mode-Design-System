/**
 * Testes Unitários para Dark Mode Design System - Theme Controller
 * 
 * @author Gabriel Demetrios Lafis
 * @version 1.0.0
 * @license MIT
 */

// Mock localStorage para testes
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia para testes de preferência do sistema
const matchMediaMock = (function() {
    let dark = false;
    return {
        setDark: function(isDark) {
            dark = isDark;
        },
        matchMedia: function(query) {
            return {
                matches: dark,
                media: query,
                onchange: null,
                addEventListener: function() {},
                removeEventListener: function() {},
                addListener: function() {},
                removeListener: function() {}
            };
        }
    };
})();

Object.defineProperty(window, 'matchMedia', { value: matchMediaMock.matchMedia });

// Carregar o script a ser testado
// Em um ambiente de navegador real, isso seria feito via <script src="..."></script>
// Para testes em Node.js, precisamos simular o ambiente do navegador ou usar JSDOM
// Para simplificar, vamos expor as funções do script para teste, se possível.
// Assumindo que o script.js é envolvido em uma IIFE e expõe um objeto global como `window.ThemeController`

// Simular o ambiente DOM mínimo necessário para o script.js
document.documentElement = document.createElement('html');
document.body = document.createElement('body');
document.getElementById = (id) => {
    if (id === 'theme-toggle') {
        const btn = document.createElement('button');
        btn.setAttribute('id', 'theme-toggle');
        btn.innerHTML = '<span class="theme-icon">🌙</span><span>Tema</span>';
        btn.querySelector = (selector) => {
            if (selector === '.theme-icon') return btn.children[0];
            return null;
        };
        return btn;
    }
    return null;
};

// Simular a inclusão do script.js
// Para fins de teste, vamos redefinir o window.ThemeController após cada teste
// para garantir um estado limpo.

// Conteúdo do script.js (para ser executado e expor ThemeController)
const scriptContent = `
    ${require('fs').readFileSync('./Dark-Mode-Design-System/src/script.js', 'utf8')}
`;

// Função para carregar e executar o script.js em um contexto isolado
function loadThemeController() {
    localStorage.clear(); // Limpa o localStorage antes de cada carga
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light'); // Default para light
    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.body.appendChild(script);
    return window.ThemeController;
}

// Testes
describe('ThemeController', () => {
    let ThemeController;

    beforeEach(() => {
        // Resetar o DOM e localStorage antes de cada teste
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
        matchMediaMock.setDark(false); // Padrão para sistema claro
        // Recarregar o script para garantir um estado limpo
        ThemeController = loadThemeController();
    });

    test('should initialize with system theme if no saved theme', () => {
        matchMediaMock.setDark(true);
        ThemeController = loadThemeController(); // Recarregar para pegar a preferência do sistema
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('should initialize with saved theme if available', () => {
        localStorage.setItem('theme', 'dark');
        ThemeController = loadThemeController();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('should toggle theme from light to dark', () => {
        document.documentElement.setAttribute('data-theme', 'light');
        ThemeController.toggle();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should toggle theme from dark to light', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        ThemeController.toggle();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('theme')).toBe('light');
    });

    test('should update toggle button aria-label and icon', () => {
        const toggleButton = document.getElementById('theme-toggle');
        expect(toggleButton.getAttribute('aria-label')).toBe('Alternar para modo escuro');
        expect(toggleButton.querySelector('.theme-icon').textContent).toBe('🌙');

        ThemeController.toggle(); // Light to Dark
        expect(toggleButton.getAttribute('aria-label')).toBe('Alternar para modo claro');
        expect(toggleButton.querySelector('.theme-icon').textContent).toBe('☀️');

        ThemeController.toggle(); // Dark to Light
        expect(toggleButton.getAttribute('aria-label')).toBe('Alternar para modo escuro');
        expect(toggleButton.querySelector('.theme-icon').textContent).toBe('🌙');
    });

    test('get() should return current theme', () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        expect(ThemeController.get()).toBe('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        expect(ThemeController.get()).toBe('light');
    });

    test('getSystemTheme() should return system preference', () => {
        matchMediaMock.setDark(true);
        expect(ThemeController.getSystemTheme()).toBe('dark');
        matchMediaMock.setDark(false);
        expect(ThemeController.getSystemTheme()).toBe('light');
    });
});

