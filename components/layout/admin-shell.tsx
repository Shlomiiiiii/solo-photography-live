"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  Camera,
  CreditCard,
  GalleryHorizontal,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  X
} from "lucide-react";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/layout/global-search";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/galleries", label: "Galleries", icon: GalleryHorizontal },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children, adminEmail }: { children: React.ReactNode; adminEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [light, setLight] = useState(false);

  const activeLabel = useMemo(() => {
    return navItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("light", light);
    document.documentElement.classList.toggle("dark", !light);
  }, [light]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (!typing && event.key.toLowerCase() === "n") {
        router.push("/clients?new=1");
      }
      if (event.key === "Escape") setSearchOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut(auth);
    toast.success("Signed out");
    router.replace("/login");
  }

  const sidebar = (
    <aside
      className={cn(
        "glass-panel fixed inset-y-3 left-3 z-40 flex flex-col rounded-[1.75rem] transition-all duration-300",
        collapsed ? "w-[5.25rem]" : "w-[17.5rem]",
        "max-lg:w-[17.5rem]"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <Link href="/dashboard" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-ink">
          <Camera className="h-5 w-5" />
        </Link>
        <div className={cn("min-w-0 transition", collapsed && "lg:hidden")}>
          <p className="truncate text-sm font-semibold text-white">{APP_NAME}</p>
          <p className="truncate text-xs text-white/45">Admin studio</p>
        </div>
      </div>

      <nav className="grid gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
                active ? "bg-white text-ink shadow-glow" : "text-white/62 hover:bg-white/10 hover:text-white"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-2 p-3">
        <Button className={cn(collapsed && "lg:px-0")} variant="ghost" onClick={() => setLight((value) => !value)}>
          {light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className={cn(collapsed && "lg:hidden")}>{light ? "Dark mode" : "Light mode"}</span>
        </Button>
        <Button className={cn(collapsed && "lg:px-0")} variant="ghost" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span className={cn(collapsed && "lg:hidden")}>Logout</span>
        </Button>
        <Button
          className="hidden lg:inline-flex"
          variant="ghost"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
          <span className={cn(collapsed && "lg:hidden")}>{collapsed ? "Expand" : "Collapse"}</span>
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen">
      <div className="hidden lg:block">{sidebar}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
              {sidebar}
            </motion.div>
            <Button className="absolute right-4 top-4" size="icon" variant="secondary" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className={cn("min-h-screen px-4 pb-8 pt-4 transition-all sm:px-6", collapsed ? "lg:pl-28" : "lg:pl-80")}>
        <header className="sticky top-3 z-30 mb-6 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-ink/65 p-2 shadow-panel backdrop-blur-2xl">
          <Button className="lg:hidden" size="icon" variant="ghost" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 px-2">
            <p className="truncate text-xs text-white/45">{adminEmail ?? "Admin"}</p>
            <h1 className="truncate text-lg font-semibold text-white">{activeLabel}</h1>
          </div>
          <button
            className="luxury-focus ml-auto hidden h-11 min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 text-left text-sm text-white/42 transition hover:bg-white/10 md:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            Search everything
            <span className="ml-auto rounded-lg border border-white/10 px-2 py-0.5 text-xs text-white/35">⌘K</span>
          </button>
          <Button size="icon" variant="secondary" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="primary" onClick={() => router.push("/galleries?new=1")} aria-label="New gallery">
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {children}
      </main>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

