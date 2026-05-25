# View Transitions

## Overview

Astro's View Transitions enable smooth page-to-page navigation in multi-page apps (MPA). The `<ClientRouter />` component intercepts navigation and provides animated transitions.

## Setup

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from 'astro:transitions';
---
<html lang="pt-BR">
  <head>
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Note**: `ViewTransitions` was renamed to `ClientRouter` in Astro 5 and removed in Astro 6. Always use `ClientRouter`.

## Transition Directives

### transition:name

Pair elements across pages for morphing animations:

```astro
<!-- Page 1 -->
<img transition:name="hero" src="/hero.jpg" />

<!-- Page 2 -->
<img transition:name="hero" src="/hero.jpg" />
```

### transition:animate

Control animation type:

```astro
<div transition:animate="slide">    <!-- Slides in/out -->
<div transition:animate="fade">     <!-- Fades in/out (default) -->
<div transition:animate="none">     <!-- No animation -->
<div transition:animate="initial">  <!-- Browser default -->
```

### transition:persist

Keep elements alive across navigations (e.g., audio players, video):

```astro
<video transition:persist autoplay>
  <source src="/video.mp4" />
</video>
```

Also works with islands to preserve state:

```astro
<Counter client:load transition:persist />
```

## Custom Animations

```astro
---
import { fade, slide } from 'astro:transitions';
---

<!-- Built-in with options -->
<div transition:animate={fade({ duration: '0.5s' })}>
<div transition:animate={slide({ duration: '0.3s' })}>

<!-- Custom animation -->
<div transition:animate={{
  old: {
    name: 'customFadeOut',
    duration: '0.3s',
    easing: 'ease-out',
    fillMode: 'forwards',
  },
  new: {
    name: 'customFadeIn',
    duration: '0.3s',
    easing: 'ease-in',
    fillMode: 'backwards',
  },
}}>
```

## Lifecycle Events

```html
<script>
  document.addEventListener('astro:before-preparation', (ev) => {
    // Before new page loads
  });

  document.addEventListener('astro:after-preparation', (ev) => {
    // New page loaded, before swap
  });

  document.addEventListener('astro:before-swap', (ev) => {
    // Before DOM swap
  });

  document.addEventListener('astro:after-swap', (ev) => {
    // After DOM swap, before animations
  });

  document.addEventListener('astro:page-load', (ev) => {
    // After everything completes (replaces DOMContentLoaded)
  });
</script>
```

## Script Re-execution

Scripts in `<head>` only run once. Use `astro:page-load` for scripts that must re-run:

```html
<script>
  document.addEventListener('astro:page-load', () => {
    // Runs on every page navigation
    setupEventListeners();
  });
</script>
```

## Fallback Behavior

For browsers without View Transition API support:

```astro
<ClientRouter fallback="swap" />  <!-- Instant swap (default) -->
<ClientRouter fallback="animate" />  <!-- CSS animation fallback -->
<ClientRouter fallback="none" />  <!-- Full page reload -->
```

## Reduced Motion

Astro automatically respects `prefers-reduced-motion`:
- Transitions are disabled when user prefers reduced motion
- Falls back to instant swap

## Single-Page Use

For single-page sites (like this project), `ClientRouter` still provides:
- Smooth scroll behavior
- History management
- Script lifecycle events
- Future multi-page transition readiness
