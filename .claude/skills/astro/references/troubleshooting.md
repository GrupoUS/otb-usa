# Troubleshooting

## Build Errors

### "Cannot find module" / Import Errors

```
Cannot find module './Component.astro'
```

**Causes & Fixes:**
- Wrong file path → Check case sensitivity (Linux is case-sensitive)
- Missing file extension → Always include `.astro`, `.tsx`, `.ts`
- Missing dependency → Run `bun install`

### Content Collection Errors

```
[content] Unable to find collection "speakers"
```

**Fixes:**
- Ensure directory exists: `src/content/speakers/`
- At least one file must exist in the directory
- File must be valid JSON/YAML/MD
- Restart dev server after adding new collections

### TypeScript Errors

```bash
# Check for type errors
bunx astro check
```

Common fixes:
- Add `interface Props` for component props
- Use `unknown` instead of `any`
- Import types with `import type {}`
- Check `tsconfig.json` extends correct base

### Vite/Build Errors

```
[vite] Pre-transform error: Failed to resolve import
```

**Fixes:**
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `rm -rf node_modules && bun install`
- Check import paths are correct

## Hydration Errors

### "Hydration mismatch"

React expects server HTML to match client render.

**Common causes:**
1. **Date/time rendering** — Server and client in different timezones
   ```tsx
   // ❌ Renders different on server vs client
   <p>{new Date().toLocaleString()}</p>

   // ✅ Use client:only or suppressHydrationWarning
   <DateDisplay client:only="react" />
   ```

2. **Random values**
   ```tsx
   // ❌ Different on server and client
   <div id={`el-${Math.random()}`}>

   // ✅ Use deterministic IDs
   <div id={`el-${props.index}`}>
   ```

3. **Browser-only APIs**
   ```tsx
   // ❌ window undefined on server
   const width = window.innerWidth;

   // ✅ Guard with typeof check
   const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
   ```

4. **Conditional rendering based on client state**
   ```tsx
   // ❌ Differs between server/client
   {localStorage.getItem('theme') === 'dark' && <DarkMode />}

   // ✅ Use useEffect for client-only state
   const [theme, setTheme] = useState('light');
   useEffect(() => {
     setTheme(localStorage.getItem('theme') || 'light');
   }, []);
   ```

### "client:* directive on .astro component"

**Fix:** Client directives only work on framework components (React/Vue/Svelte), not `.astro` files.

## Styling Issues

### Tailwind Classes Not Working

1. **Check `@import "tailwindcss"`** in global.css
2. **Check Vite plugin** in astro.config.mjs:
   ```js
   vite: { plugins: [tailwindcss()] }
   ```
3. **Check `@theme` tokens** — Custom colors need `--color-` prefix
4. **Clear cache**: `rm -rf node_modules/.vite && bun run dev`

### Scoped Styles Not Applying

- Styles in `.astro` files only target elements in THAT component
- Child component elements need `:global()` or `is:global`
- Tailwind utility classes are always global

### CLS (Layout Shift)

- Set `width` and `height` on all `<img>` and `<Image>` elements
- Use `aspect-ratio` for responsive containers
- Avoid dynamic content that changes layout after load

## Dev Server Issues

### Port Already in Use

```bash
# Find and kill process on port 4321
lsof -i :4321
kill -9 <PID>
```

### HMR Not Working

- Check file is in `src/` directory
- Restart dev server
- Clear Vite cache: `rm -rf node_modules/.vite`

### Slow Development Build

- Large `public/` images slow dev server → Optimize images
- Too many Content Collection entries → Use filtering
- Heavy npm packages → Consider lighter alternatives

## Deployment Issues

### Build Works Locally But Fails on CI

- Check Node.js version matches
- Ensure `bun.lockb` is committed
- Check environment variables are set
- Verify build command is correct: `bun run build`

### Missing Assets in Production

- Files in `src/` → Processed by Vite (hashed filenames)
- Files in `public/` → Copied as-is (original filenames)
- Check base path in `astro.config.mjs`

## Performance Debugging

```bash
# Build analysis
bun run build 2>&1 | grep -E "\.js|\.css|total"

# Type check
bunx astro check

# Lighthouse
npx lighthouse http://localhost:4321 --preset=desktop
```

## Quick Diagnostic Commands

```bash
# Full health check
bunx astro check && bun run build

# Clear all caches
rm -rf node_modules/.vite dist .astro

# Fresh start
rm -rf node_modules && bun install && bun run dev
```
