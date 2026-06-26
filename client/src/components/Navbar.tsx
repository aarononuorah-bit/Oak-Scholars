import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "/manus-storage/oak-logo_feb9f1bb.webp";

const navLinks = [
  { label: "Tuition", href: "/booking" },
  { label: "Study Resources", href: "/study-resources" },
  { label: "Support", href: "/support-guidance" },
  { label: "How It Works", href: "/#how-it-works" },
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

  // Only show transparent purple navbar on the homepage hero; everywhere else use solid white
  const isHome = location === "/";
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  // scrolled = we should show the white/solid navbar
  const scrolled = !isHome || !atTop;

  useEffect(() => setMenuOpen(false), [location]);

  // Determine if a nav link is active
  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false; // anchor links never "active"
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white shadow-md py-1 border-b border-gray-100" 
          : "bg-[#281A39] lg:bg-transparent py-2"
      }`}
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
              className="font-serif font-bold text-xl tracking-wide uppercase hidden sm:inline whitespace-nowrap transition-colors duration-300"
              style={{ color: scrolled ? "#281A39" : "#E8A838" }}
            >
              Oak Scholars
            </span>
          </Link>

          {/* Desktop nav - centered */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center px-4">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out py-1 ${
                    scrolled
                      ? active
                        ? "text-[#281A39]"
                        : "text-gray-600 hover:text-[#281A39]"
                      : active
                        ? "text-[#E8A838]"
                        : "text-white/80 lg:text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                  {/* Active underline indicator */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{ backgroundColor: scrolled ? "#281A39" : "#E8A838" }}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA - right side */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <Link href="/tutor-apply">
              <Button
                variant="outline"
                size="sm"
                className={`font-semibold transition-all duration-200 ease-out ${
                  scrolled
                    ? "border-[#281A39]/20 text-[#281A39] hover:bg-[#281A39]/5 bg-transparent"
                    : "border-white/30 text-white hover:bg-white/10 bg-transparent"
                }`}
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
                    className={`transition-all duration-200 gap-2 ${
                      scrolled
                        ? "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                        : "border-white/30 text-white hover:bg-white/10 bg-transparent"
                    }`}
                  >
                    <User size={15} />
                    {user?.name?.split(" ")[0] ?? "Account"}
                    <ChevronDown size={12} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 animate-in fade-in-0 zoom-in-95 duration-200">
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
              <a href={getLoginUrl()}>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    scrolled
                      ? "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                      : "border-white/30 text-white hover:bg-white/10 bg-transparent"
                  }`}
                >
                  <User size={15} />
                  Login
                </Button>
              </a>
            )}

            <Link href="/booking">
              <Button
                size="sm"
                className="btn-press font-semibold shadow-md"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book a Session
              </Button>
            </Link>

            {/* Dark mode toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all duration-200 ml-1 ${
                  scrolled 
                    ? "text-gray-600 hover:bg-gray-100 hover:text-gray-800" 
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  scrolled ? "text-[#281A39] hover:bg-gray-100" : "text-white hover:bg-white/10"
                }`}
                aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              className={`p-2 rounded-md transition-all duration-200 ${
                scrolled ? "text-[#281A39] hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#281A39]/98 backdrop-blur-md border-t border-white/10">
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/80 hover:text-[#E8A838] font-medium py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <Link href="/tutor-apply">
                <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10">
                  Become an Oak Scholar
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account">
                    <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10">
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white bg-transparent hover:bg-white/10"
                    onClick={() => logoutMutation.mutate(undefined)}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <a href={getLoginUrl()} className="w-full">
                  <Button variant="outline" className="w-full border-white/30 text-white bg-transparent hover:bg-white/10">
                    Login
                  </Button>
                </a>
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
