import { Link } from "@tanstack/react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const continuousDistributions = [
  { title: "Exponencial", to: "/exponencial" },
  { title: "Weibull", to: "/weibull" },
  { title: "Gumbel mínimo", to: "/gumbel-minimo" },
  { title: "Gumbel máximo", to: "/gumbel-maximo" },
  { title: "Pareto", to: "/pareto" },
  { title: "Uniforme", to: "/uniforme" },
  { title: "Normal", to: "/normal" },
  { title: "Log normal", to: "/log-normal" },
  { title: "Gamma", to: "/gamma" },
]

const discreteDistributions = [{ title: "Poisson", to: "/poisson" }]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-sm font-semibold">Distribuciones</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel> Continuas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {continuousDistributions.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={
                      <Link to={item.to} activeOptions={{ exact: true }} />
                    }
                    className="aria-[current=page]:bg-primary/15 aria-[current=page]:text-primary"
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Discretas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {discreteDistributions.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={
                      <Link to={item.to} activeOptions={{ exact: true }} />
                    }
                    className="aria-[current=page]:bg-primary/15 aria-[current=page]:text-primary"
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
