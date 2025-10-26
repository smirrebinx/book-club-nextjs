# Accessibility Guidelines

This document outlines accessibility best practices for the Barnfria bokklubben application to ensure WCAG AA compliance.

## Table of Contents
- [Semantic HTML](#semantic-html)
- [Keyboard Navigation](#keyboard-navigation)
- [Focus Management](#focus-management)
- [ARIA Usage](#aria-usage)
- [Motion and Animation](#motion-and-animation)
- [Color and Contrast](#color-and-contrast)
- [Forms and Input](#forms-and-input)

## Semantic HTML

### Best Practices
- **Use proper heading hierarchy**: Start with `<h1>` and don't skip levels (h1 → h2 → h3)
- **Use semantic elements**: `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`, `<header>`, `<footer>`
- **Use `<button>` for actions**: Never use `<div>` or `<span>` with click handlers
- **Use `<a>` for navigation**: Links should navigate, buttons should perform actions
- **Use lists for lists**: `<ul>`, `<ol>`, and `<dl>` for appropriate content

### Examples
```tsx
// Good
<button onClick={handleSubmit}>Submit</button>
<a href="/about">About Us</a>

// Bad
<div onClick={handleSubmit}>Submit</div>
<button onClick={() => router.push('/about')}>About Us</button>
```

## Keyboard Navigation

### Requirements (WCAG 2.1.1, 2.1.2)
- All interactive elements must be keyboard accessible
- Focus order should be logical and intuitive
- No keyboard traps (users can navigate away from any element)

### Best Practices
- **Tab order**: Ensure tab order matches visual layout
- **Skip links**: Consider adding "Skip to main content" for complex layouts
- **Custom components**: If building custom interactive components, implement proper keyboard support

### Keyboard Patterns
| Component | Keys | Action |
|-----------|------|--------|
| Button | Enter, Space | Activate |
| Link | Enter | Navigate |
| Dropdown | Arrow keys | Navigate options |
| Modal | Escape | Close |
| Tabs | Arrow keys | Switch tabs |

## Focus Management

### Requirements (WCAG 2.4.7)
- Focus indicator must be visible and meet contrast requirements (3:1 minimum)
- Focus should be managed when content changes dynamically
- Don't remove focus outlines without providing an alternative

### Best Practices
```tsx
// Good - Maintain focus when opening modals
useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);

// Good - Custom focus styles
<button className="focus:outline-2 focus:outline-offset-2 focus:outline-primary">
  Click me
</button>

// Bad - Removing outlines without alternative
<button className="outline-none">Click me</button>
```

### Focus Order After Dynamic Changes
- When adding/removing content, manage focus appropriately
- When closing a modal, return focus to the trigger element
- When deleting an item, move focus to the next logical element

## ARIA Usage

### When to Use ARIA
ARIA should be used to enhance semantics when HTML alone is insufficient. Follow the "First Rule of ARIA": **Don't use ARIA if you can use native HTML instead**.

### Common ARIA Patterns

#### Labels and Descriptions
```tsx
// Required for form inputs without visible labels
<input type="search" aria-label="Search books" />

// For additional context
<button aria-describedby="delete-description">Delete</button>
<p id="delete-description">This action cannot be undone</p>
```

#### Live Regions (WCAG 4.1.3)
```tsx
// For dynamic content updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Use aria-live="assertive" only for urgent messages
<div aria-live="assertive">{errorMessage}</div>
```

#### Hidden Content
```tsx
// Hide decorative images from screen readers
<img src="decoration.svg" alt="" aria-hidden="true" />

// Hide purely visual animations
<LottieAnimation aria-hidden="true" />
```

#### States and Properties
```tsx
// Button states
<button aria-pressed={isPressed}>Toggle</button>
<button aria-expanded={isExpanded}>Menu</button>

// Form validation
<input aria-invalid={hasError} aria-describedby="error-message" />
{hasError && <span id="error-message">{errorText}</span>}
```

### ARIA Anti-Patterns
```tsx
// Bad - redundant ARIA
<button aria-label="Submit">Submit</button>

// Good - visible text is sufficient
<button>Submit</button>

// Bad - div with button role
<div role="button" tabIndex={0} onClick={handleClick}>Click</div>

// Good - use native button
<button onClick={handleClick}>Click</button>
```

## Motion and Animation

### Requirements (WCAG 2.2.2, 2.3.1)
- Auto-playing animations must be pausable, stoppable, or hideable
- Respect `prefers-reduced-motion` user preference
- No flashing content more than 3 times per second

### Implementation
```tsx
// Good - Respects user preferences
const [shouldAutoplay, setShouldAutoplay] = useState(autoplay);

useEffect(() => {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setShouldAutoplay(!mediaQuery.matches && autoplay);

  const handleChange = (e: MediaQueryListEvent) => {
    setShouldAutoplay(!e.matches && autoplay);
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, [autoplay]);
```

### CSS Approach
```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Color and Contrast

### Requirements (WCAG 1.4.3, 1.4.11)
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum
- **UI components and graphics**: 3:1 minimum

### Current Color Palette
Our application meets WCAG AA standards:

| Usage | Color | Background | Ratio | Status |
|-------|-------|------------|-------|--------|
| Primary text | #1A1A1A | #ffffff | ~15:1 | AAA |
| Secondary text | #2E2E2E | #ffffff | ~13:1 | AAA |
| Muted text | #4A4A4A | #ffffff | ~9:1 | AAA |

### Best Practices
- **Don't rely on color alone**: Use icons, labels, or patterns in addition to color
- **Test with tools**: Use browser DevTools or online contrast checkers
- **Consider color blindness**: Test designs with color blindness simulators

## Forms and Input

### Requirements (WCAG 1.3.1, 3.3.1, 3.3.2)
- All form inputs must have accessible labels
- Error messages must be programmatically associated with inputs
- Purpose of inputs should be clear

### Best Practices
```tsx
// Good - Explicit label association
<label htmlFor="email">Email Address</label>
<input id="email" type="email" required />

// Good - Error handling
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" className="error">
    Please enter a valid email address
  </span>
)}

// Good - Required field indication
<label htmlFor="name">
  Name <span aria-label="required">*</span>
</label>
<input id="name" type="text" required />
```

### Form Validation
- Show errors clearly and associate them with inputs
- Provide suggestions for fixing errors
- Don't clear form data when validation fails
- Announce errors to screen readers using `aria-live`

## Testing Checklist

### Manual Testing
- [ ] Navigate entire site using only keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify focus indicators are visible on all interactive elements
- [ ] Test with browser zoom at 200%
- [ ] Verify all images have appropriate alt text
- [ ] Check color contrast with DevTools or online tools
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify page title and language attributes

### Automated Testing
Consider adding these tools:
- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built into Chrome DevTools
- **eslint-plugin-jsx-a11y**: ESLint rules for accessibility
- **jest-axe**: Automated testing in Jest tests

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contributing

When adding new features:
1. Review this document before implementation
2. Test with keyboard navigation
3. Verify color contrast meets requirements
4. Add appropriate ARIA attributes when needed
5. Test with a screen reader if possible
