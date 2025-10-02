/**
 * Dark Mode Design System - Theme Controller
 * 
 * Sistema de controle de temas com suporte a modo claro/escuro,
 * detecção automática de preferências do sistema e persistência local.
 * 
 * @author Gabriel Demetrios Lafis
 * @version 1.0.0
 * @license MIT
 */

(function() {
  'use strict';

  // Constantes do sistema
  const STORAGE_KEY = 'theme';
  const THEME_LIGHT = 'light';
  const THEME_DARK = 'dark';
  const DATA_ATTRIBUTE = 'data-theme';

  /**
   * Detecta a preferência de tema do sistema operacional
   * @returns {string} 'dark' se o sistema prefere modo escuro, 'light' caso contrário
   */
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  /**
   * Obtém o tema salvo no localStorage
   * @returns {string|null} Tema salvo ou null se não houver
   */
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Erro ao acessar localStorage:', error);
      return null;
    }
  }

  /**
   * Salva o tema no localStorage
   * @param {string} theme - Tema a ser salvo
   */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Erro ao salvar tema no localStorage:', error);
    }
  }

  /**
   * Aplica o tema ao documento
   * @param {string} theme - Tema a ser aplicado ('light' ou 'dark')
   */
  function applyTheme(theme) {
    // Remove tema anterior
    document.documentElement.removeAttribute(DATA_ATTRIBUTE);
    
    // Aplica novo tema se for escuro
    if (theme === THEME_DARK) {
      document.documentElement.setAttribute(DATA_ATTRIBUTE, THEME_DARK);
    }

    // Atualiza botão de toggle se existir
    updateToggleButton(theme);

    // Dispara evento customizado para outros componentes reagirem
    const themeChangeEvent = new CustomEvent('themechange', {
      detail: { theme: theme }
    });
    document.dispatchEvent(themeChangeEvent);
  }

  /**
   * Atualiza o estado visual do botão de toggle
   * @param {string} theme - Tema atual
   */
  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    // Atualiza aria-label para acessibilidade
    const newLabel = theme === THEME_DARK 
      ? 'Alternar para modo claro' 
      : 'Alternar para modo escuro';
    toggleButton.setAttribute('aria-label', newLabel);

    // Atualiza ícone se houver elementos específicos
    const icon = toggleButton.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === THEME_DARK ? '☀️' : '🌙';
    }
  }

  /**
   * Alterna entre temas claro e escuro
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute(DATA_ATTRIBUTE);
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    applyTheme(newTheme);
    saveTheme(newTheme);
  }

  /**
   * Inicializa o sistema de temas
   */
  function initTheme() {
    // Determina o tema inicial: salvo > sistema > padrão (light)
    const savedTheme = getSavedTheme();
    const initialTheme = savedTheme || getSystemTheme();
    
    applyTheme(initialTheme);

    // Configura listener para mudanças nas preferências do sistema
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Usa addEventListener se disponível, caso contrário addListener (compatibilidade)
      const handleChange = (e) => {
        // Só aplica mudança automática se não houver preferência salva
        if (!getSavedTheme()) {
          const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
          applyTheme(newTheme);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
      }
    }
  }

  /**
   * Configura event listeners após carregamento do DOM
   */
  function setupEventListeners() {
    // Botão de toggle principal
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
    }

    // Suporte a múltiplos botões de toggle
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      button.addEventListener('click', toggleTheme);
    });

    // Atalho de teclado: Ctrl/Cmd + Shift + D para alternar tema
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Inicializa o tema imediatamente para evitar flash
  initTheme();

  // Aguarda carregamento do DOM para configurar event listeners
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }

  // Expõe API pública para uso programático
  window.ThemeController = {
    toggle: toggleTheme,
    set: applyTheme,
    get: () => document.documentElement.getAttribute(DATA_ATTRIBUTE) || THEME_LIGHT,
    getSystemTheme: getSystemTheme
  };

})();
