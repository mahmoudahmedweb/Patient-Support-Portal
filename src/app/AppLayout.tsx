import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useUnreadNotificationsCount } from '@/features/notifications/api'
import { NetworkChaosToggle } from '@/components/NetworkChaosToggle'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/treatment-journey', label: 'Treatment Journey', icon: Activity, end: false },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, end: false },
  { to: '/medications', label: 'Medications', icon: Pill, end: false },
  { to: '/resources', label: 'Resources', icon: BookOpen, end: false },
  { to: '/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
] as const

function navLinkClasses({ isActive }: NavLinkRenderProps) {
  return cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface-muted',
  )
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { data: unreadCount } = useUnreadNotificationsCount()
  const mobileNavRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (mobileNavOpen) {
      mobileNavRef.current?.querySelector('a')?.focus()
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    // Escape-to-close is a document-level keyboard shortcut, not an
    // interaction on the <nav> itself, so it's wired up as a real
    // document listener rather than a synthetic handler on a
    // non-interactive element.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileNav()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen, closeMobileNav])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-surface-subtle">
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-4 top-4 z-50 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            ref={menuButtonRef}
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-ink-700 hover:bg-surface-muted md:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
            <span className="sr-only">Toggle navigation menu</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <span className="hidden font-display text-base font-semibold text-ink-950 sm:inline">
              Meridian Care
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NetworkChaosToggle />
          <Link
            to="/notifications"
            className="relative flex size-9 items-center justify-center rounded-lg text-ink-700 hover:bg-surface-muted"
            aria-label={
              unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'
            }
          >
            <Bell className="size-5" aria-hidden="true" />
            {!!unreadCount && (
              <span
                className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-danger-600 text-[10px] font-semibold text-white"
                aria-hidden="true"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-muted"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {initialsOf(user.name)}
              </span>
              <span className="hidden text-sm font-medium text-ink-900 md:inline">
                {user.name}
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-9 items-center justify-center rounded-lg text-ink-700 hover:bg-surface-muted"
          >
            <LogOut className="size-4.5" aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <nav
          aria-label="Primary"
          className="sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-white px-3 py-4 md:block"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={navLinkClasses}>
                  <item.icon className="size-4.5" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {mobileNavOpen && (
          <nav
            id="mobile-nav"
            ref={mobileNavRef}
            aria-label="Primary"
            className="fixed inset-x-0 top-16 z-30 border-b border-border bg-white px-3 py-3 shadow-[var(--shadow-popover)] md:hidden"
          >
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={navLinkClasses}
                    onClick={closeMobileNav}
                  >
                    <item.icon className="size-4.5" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
