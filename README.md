# Dark Mode Design System

![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Sistema de design completo com suporte a modo escuro, alternância de temas e conformidade com diretrizes de acessibilidade. Implementa as melhores práticas para interfaces modernas com suporte a preferências do usuário.

## 🌙 Demonstração

Este projeto oferece um sistema de design robusto que suporta automaticamente modo claro e escuro, respeitando as preferências do sistema operacional do usuário.

## ✨ Características

- **Modo Escuro Automático**: Detecção automática da preferência do sistema
- **Alternância Manual**: Botão para alternar entre temas
- **Persistência**: Salva a preferência do usuário no localStorage
- **Acessibilidade**: Conformidade com WCAG 2.1
- **Performance**: Transições suaves sem impacto na performance

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica acessível
- **CSS3**: Custom Properties, Media Queries, Transitions
- **JavaScript**: Controle de temas e persistência
- **CSS Variables**: Sistema de tokens de design

## 📁 Estrutura do Projeto

```
Dark-Mode-Design-System/
├── index.html          # Demonstração do sistema
├── styles.css          # Sistema de temas e componentes
├── script.js           # Lógica de alternância de temas
├── README.md           # Documentação
├── LICENSE             # Licença MIT
└── .gitignore          # Arquivos ignorados pelo Git
```

## 🚀 Como Usar

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/galafis/Dark-Mode-Design-System.git
cd Dark-Mode-Design-System
```

2. Abra o arquivo `index.html` no navegador:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx serve .
```

### Implementação do Sistema

#### 1. Variáveis CSS para Temas
```css
:root {
    /* Tema Claro */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --border-color: #dee2e6;
}

[data-theme="dark"] {
    /* Tema Escuro */
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: #404040;
}
```

#### 2. Detecção Automática
```css
@media (prefers-color-scheme: dark) {
    :root {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --text-primary: #ffffff;
        --text-secondary: #b0b0b0;
    }
}
```

#### 3. Controle JavaScript
```javascript
// Detectar preferência do sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Alternar tema
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

## 🎨 Sistema de Cores

### Tema Claro
- **Background Primary**: #ffffff
- **Background Secondary**: #f8f9fa
- **Text Primary**: #212529
- **Text Secondary**: #6c757d
- **Accent**: #667eea

### Tema Escuro
- **Background Primary**: #1a1a1a
- **Background Secondary**: #2d2d2d
- **Text Primary**: #ffffff
- **Text Secondary**: #b0b0b0
- **Accent**: #8b9aff

## ♿ Acessibilidade

- **Contraste**: Todas as combinações atendem WCAG AA (4.5:1)
- **Foco**: Indicadores visuais claros para navegação por teclado
- **Screen Readers**: Suporte completo com ARIA labels
- **Redução de Movimento**: Respeita `prefers-reduced-motion`

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints otimizados:

```css
/* Mobile: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

## 🔧 Personalização

### Adicionando Novos Componentes
```css
.new-component {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}
```

### Customizando Cores
```css
:root {
    --primary-hue: 230;
    --primary-saturation: 70%;
    --primary-lightness: 60%;
}
```

## 🔧 Extensões Possíveis

- [ ] Mais variações de tema (sepia, alto contraste)
- [ ] Integração com frameworks CSS
- [ ] Componentes avançados (modais, dropdowns)
- [ ] Animações de transição entre temas
- [ ] Suporte a temas personalizados
- [ ] API para controle programático

## 🤝 Contribuindo

Contribuições são bem-vindas! Para melhorar o sistema:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MelhoriaTema`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade de tema'`)
4. Push para a branch (`git push origin feature/MelhoriaTema`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Gabriel Demetrios Lafis**

- GitHub: [@galafis](https://github.com/galafis)
- Email: gabrieldemetrios@gmail.com

---

⭐ Se este projeto foi útil, considere deixar uma estrela!

