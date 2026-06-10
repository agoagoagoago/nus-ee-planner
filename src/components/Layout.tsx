import { NavLink, Outlet } from 'react-router-dom';
import { DisclaimerBanner } from './DisclaimerBanner';
import { OnboardingModal } from './OnboardingModal';

const NAV = [
  { to: '/', label: 'Explore', end: true },
  { to: '/pathways', label: 'Pathways' },
  { to: '/planner', label: 'Planner' },
  { to: '/specialisation', label: 'Specialisation' },
  { to: '/gpa', label: 'GPA What-If' },
  { to: '/about', label: 'About' },
];

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-content px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-ink">
                NUS <span className="text-copper">EE</span> Course Planner
              </span>
              <span className="hidden rounded bg-panel px-1.5 py-0.5 font-mono text-[11px] text-ink-soft sm:inline">
                AY2025/26
              </span>
            </NavLink>
          </div>
          <nav aria-label="Primary" className="-mb-px flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-copper text-copper-deep'
                      : 'border-transparent text-ink-soft hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <DisclaimerBanner />

      <main id="main" className="mx-auto w-full max-w-content flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto max-w-content px-4 py-6 text-[13px] text-ink-soft">
          <p>
            A planning aid for prospective and current NUS Electrical Engineering students
            (AY2025/26 cohort). Not affiliated with or endorsed by NUS. Verify everything against
            the official curriculum pages and your faculty&apos;s CourseReg before making academic
            decisions.
          </p>
          <p className="mt-2">
            <NavLink to="/about" className="font-medium text-teal-deep underline">
              Sources &amp; full disclaimer →
            </NavLink>
          </p>
        </div>
      </footer>

      <OnboardingModal />
    </div>
  );
}
