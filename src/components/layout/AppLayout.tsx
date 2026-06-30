import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Skip link: the first focusable thing on the page. Visually hidden (sr-only)
          until it receives keyboard focus, then it pops into view (focus:not-sr-only).
          It lets a keyboard/screen-reader user jump straight past the nav to the page
          content — without it they'd Tab through every sidebar link on every page. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 focus:shadow-lg dark:focus:bg-slate-800 dark:focus:text-slate-100"
      >
        Skip to main content
      </a>

      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />
        {/* id is the skip-link target; tabIndex={-1} lets us land focus here
            programmatically without adding it to the normal Tab order. */}
        <main id="main-content" tabIndex={-1} className="flex-1 p-6">
          {/* the matched page renders here */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
