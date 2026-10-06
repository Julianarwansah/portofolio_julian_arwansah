import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import ScrollManager from './components/ScrollManager.jsx'
import SiteLayout from './components/SiteLayout.jsx'
import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({
  once: true,
  disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
})

// Otherwise the browser restores the offset itself during the traversal task,
// against the outgoing document, so the value is clamped and lost.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ScrollManager />
        <SiteLayout />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
