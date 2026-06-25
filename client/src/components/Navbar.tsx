import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-md bg-white border-b border-gray-100"
          : ""
      }`}
      style={scrolled ? {} : { backgroundColor: "#281A39" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src={LOGO_URL}
                alt="Oak Scholars"
                className="h-8 w-auto object-contain"
              />
              <span
                className="font-serif font-bold text-lg tracking-wide uppercase hidden sm:inline whitespace-nowrap"
                style={{ color: scrolled ? "#281A39" : "#E8A838" }}
              >
                Oak Scholars
              </span>
            </Link>
            <div 
              className={`hidden lg:block h-6 w-px transition-colors duration-300 ${
                scrolled ? "bg-gray-200" : "bg-white/20"
              }`} 
            />
          </div>

          {/* Desktop nav - centered */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 flex-1 justify-center px-4 xl:px-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                  scrolled
                    ? "text-gray-700 hover:text-[#281A39]"
                    : "text-white/90 hover:text-amber-300"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA - right side */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Become an Oak Scholar - subtle outline so Book a Session stands out */}
            <Link href="/tutor-apply">
              <Button
                variant="outline"
                className={`font-semibold transition-all duration-200 ease-out ${
                  scrolled
                    ? "border-[#281A39] text-[#281A39] hover:bg-[#281A39]/8 bg-transparent"
                    : "border-white/70 text-white hover:bg-white/10 bg-transparent"
                }`}
              >
                Become an Oak Scholar
              </Button>
            </Link>

            {/* Book a Session - primary CTA, eye-catching amber with pop animation */}
            <Link href="/booking">
              <Button
                className="font-semibold shadow-md transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg active:scale-[0.97]"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book a Session
              </Button>
            </Link>

            {/* Auth buttons or user menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={scrolled
                      ? "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent gap-2"
                      : "border-white/30 text-white hover:bg-white/10 bg-transparent gap-2"
                    }
                  >
                    <User size={15} />
                    {user?.name?.split(" ")[0] ?? "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className={scrolled
                      ? "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent gap-2"
                      : "border-white/30 text-white hover:bg-white/10 bg-transparent gap-2"
                    }
                  >
                    <User size={15} />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    variant="outline"
                    className={scrolled
                      ? "border-[#281A39] text-[#281A39] hover:bg-[#281A39] hover:text-white bg-transparent gap-2"
                      : "border-amber-300 text-amber-200 hover:bg-white/10 bg-transparent gap-2"
                    }
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}

            {/* Dark mode toggle - Last item */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ml-2 ${
                  scrolled 
                    ? "text-gray-600 hover:bg-gray-200 hover:text-gray-800" 
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
                  scrolled ? "text-gray-700" : "text-white"
                }`}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              className={`p-2 transition-colors ${
                scrolled ? "text-gray-700" : "text-white"
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
        <div className={`lg:hidden backdrop-blur-md border-t transition-colors duration-300 ${
          scrolled
            ? "bg-gray-50 border-gray-200"
            : "bg-navy/98 border-white/10"
        }`}>
          <div className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-medium py-2 transition-colors ${
                  scrolled
                    ? "text-gray-700 hover:text-[#281A39]"
                    : "text-white/90 hover:text-amber-300"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className={`flex flex-col gap-3 pt-2 border-t ${
              scrolled ? "border-gray-200" : "border-white/10"
            }`}>
              <Link href="/tutor-apply" className="w-full">
                <Button
                  variant="outline"
                  className="w-full font-semibold border-[#281A39] text-[#281A39] hover:bg-[#281A39]/8 bg-transparent"
                >
                  Become an Oak Scholar
                </Button>
              </Link>
              <Link href="/booking" className="w-full">
                <Button
                  className="w-full font-semibold shadow-md transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.97]"
                  style={{ backgroundColor: "#E8A838", color: "#281A39" }}
                >
                  Book a Session
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account" className="w-full">
                    <Button
                      variant="outline"
                      className={`w-full ${
                        scrolled
                          ? "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
                          : "border-white/30 text-white bg-transparent hover:bg-white/10"
                      }`}
                    >
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className={`w-full ${
                      scrolled
                        ? "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
                        : "border-white/30 text-white bg-transparent hover:bg-white/10"
                    }`}
                    onClick={() => logoutMutation.mutate(undefined)}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button
                      variant="outline"
                      className={`w-full ${
                        scrolled
                          ? "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
                          : "border-white/30 text-white bg-transparent hover:bg-white/10"
                      }`}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button
                      variant="outline"
                      className={`w-full ${
                        scrolled
                          ? "border-[#281A39] text-[#281A39] bg-transparent hover:bg-[#281A39] hover:text-white"
                          : "border-amber-300 text-amber-200 bg-transparent hover:bg-white/10"
                      }`}
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
