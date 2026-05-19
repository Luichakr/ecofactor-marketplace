import { Outlet } from 'react-router-dom'
import { AppShell } from '../shared/ui/AppShell/AppShell'
import { BottomNav } from '../shared/ui/BottomNav/BottomNav'
import { BookmarkToast } from '../features/favorites/ui/BookmarkToast/BookmarkToast'
import { QuickAddSheet } from '../features/quick-add/ui/QuickAddSheet/QuickAddSheet'
import { SearchProvider } from '../features/search/ui/SearchTrigger/SearchTrigger'
import { SupportLauncher } from '../features/support/ui/SupportLauncher/SupportLauncher'

export function AppLayout() {
  return (
    <SearchProvider>
      <AppShell>
        <Outlet />
        <BottomNav />
        <BookmarkToast />
        <QuickAddSheet />
        <SupportLauncher />
      </AppShell>
    </SearchProvider>
  )
}
