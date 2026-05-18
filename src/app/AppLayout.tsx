import { Outlet } from 'react-router-dom'
import { AppShell } from '../shared/ui/AppShell/AppShell'
import { BottomNav } from '../shared/ui/BottomNav/BottomNav'

export function AppLayout() {
  return (
    <AppShell>
      <Outlet />
      <BottomNav />
    </AppShell>
  )
}
