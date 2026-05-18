import { Outlet } from 'react-router-dom'
import { AppShell } from '../shared/ui/AppShell/AppShell'
import { BottomNav } from '../shared/ui/BottomNav/BottomNav'
import { BookmarkToast } from '../features/favorites/ui/BookmarkToast/BookmarkToast'

export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <BottomNav />
      <BookmarkToast />
    </AppShell>
  )
}
