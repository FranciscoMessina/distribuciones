/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute } from "@tanstack/react-router"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <div>
            <p className="text-sm font-medium">Distribuciones continuas</p>
            <p className="text-xs text-muted-foreground">
              Selecciona una distribución en la barra lateral.
            </p>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
