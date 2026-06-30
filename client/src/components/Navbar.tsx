import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "/manus-storage/oak-logo_feb9f1bb.webp";

// navLinks without "How It Works"
const navLinks = [
  { label: "Tuition", href: "/booking" },
  { label: "Study Resources", href: "/study-resources" },
  { label: "Support", href: "/support-guidance" },
  { label: "Our Philosophy", href: "/philosophy" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  // Always purple navbar — transparent on homepage hero at top, solid purple when scrolled or on other pages
  const isHome = location === "/";
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scrolled = show solid purple navbar (not white)
  const scrolled = !isHome || !atTop;

  useEffect(() => setMenuOpen(false), [location]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  // Dashboard link based on role
  const dashboardHref =
    user?.role === "admin" ? "/admin" :
    user?.role === "tutor" ? "/tutor-dashboard" :
    user?.role === "parent" ? "/parent-dashboard" :
    "/student-dashboard";

  // Always white text on purple background
  const textColor = "text-white";
  const mutedColor = "text-white/90 hover:text-white";
  const activeColor = "text-[#E8A838]";
  const underlineColor = "#E8A838";

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#281A39] shadow-md border-b border-white/10"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img
              src={LOGO_URL}
              alt="Oak Scholars"
              className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className="font-serif font-bold text-xl tracking-wide uppercase hidden sm:inline whitespace-nowrap text-[#E8A838]"
            >
              Oak Scholars
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center px-4">
            {navLinks.map((link, idx) => {
              const active = isActive(link.href);
              const isFirst = idx === 0;
              const isLast = idx === navLinks.length - 1;
              
              return (
                <div key={link.href} className="flex items-center">
                  {isFirst && (
                    <span className="mr-6 h-5 w-px bg-white/30" />
                  )}
                  <a
                    href={link.href}
                    className={`relative text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out px-3 py-1 rounded-md ${
                      active ? activeColor : mutedColor
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-200 ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ backgroundColor: underlineColor }}
                    />
                  </a>
                  {isLast && (
                    <span className="ml-6 h-5 w-px bg-white/30" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop CTA — order: Book a Session | Become an Oak Scholar | Login/Account | Dark/Light toggle */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <Link href="/booking">
              <Button
                size="sm"
                className="btn-press font-semibold shadow-md"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book a Session
              </Button>
            </Link>

            <Link href="/tutor-apply">
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold transition-all duration-200 btn-press text-white hover:bg-white/10"
              >
                Become an Oak Scholar
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="transition-all duration-200 gap-2 btn-press border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    <User size={15} />
                    {user?.name?.split(" ")[0] ?? "Account"}
                    <ChevronDown size={12} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 animate-in fade-in-0 zoom-in-95 duration-200">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref} className="flex items-center gap-2">
                      <LayoutDashboard size={14} />
                      {user?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => logoutMutation.mutate(undefined)}
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all duration-200 btn-press border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <User size={15} />
                  Login
                </Button>
              </Link>
            )}

            {/* Dark/light mode toggle — always last */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light mode"
              className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-md transition-all duration-200 text-white hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#281A39] border-t border-white/10">
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-[#E8A838] font-medium px-3 py-2.5 rounded-md transition-colors hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-white/10">
              <Link href="/tutor-apply">
                <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 btn-press">
                  Become an Oak Scholar
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href={dashboardHref}>
                    <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 btn-press">
                      {user?.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                    </Button>
                  </Link>
                  <Link href="/account">
                    <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 btn-press">
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 btn-press"
                    onClick={() => logoutMutation.mutate(undefined)}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10 btn-press">
                    Login
                  </Button>
                </Link>
              )}
              <Link href="/booking">
                <Button className="w-full btn-press font-semibold" style={{ backgroundColor: "#E8A838", color: "#281A39" }}>
                  Book a Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
