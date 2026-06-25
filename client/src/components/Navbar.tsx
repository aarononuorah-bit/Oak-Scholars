import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "/manus-storage/oak-logo_35a8e9ad.webp";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Study Resources", href: "/study-resources" },
  { label: "Support", href: "/support-guidance" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Our Philosophy", href: "/philosophy" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-lg bg-white"
          : ""
      }`}
      style={scrolled ? {} : { backgroundColor: "#281A39" }}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                  scrolled
                    ? "text-gray-700 hover:text-[#281A39]"
                    : "text-white/80 hover:text-amber"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link href="/tutor-apply">
              <Button
                variant="outline"
                size="sm"
                className={scrolled
                  ? "border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent whitespace-nowrap"
                  : "border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent whitespace-nowrap"
                }
              >
                Become a Tutor
              </Button>
            </Link>
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
              <a href={getLoginUrl()}>
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
              </a>
            )}
            <Link href="/booking">
              <Button
                size="sm"
                className="btn-press font-semibold"
                style={{ backgroundColor: "#E8A838", color: "#281A39" }}
              >
                Book a Session
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`lg:hidden p-2 transition-colors ${
              scrolled ? "text-gray-700" : "text-white"
            }`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={`lg:hidden backdrop-blur-md border-t ${
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
                    : "text-white/80 hover:text-amber"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className={`flex flex-col gap-3 pt-2 border-t ${
              scrolled ? "border-gray-200" : "border-white/10"
            }`}>
              <Link href="/tutor-apply">
                <Button
                  variant="outline"
                  className={`w-full ${
                    scrolled
                      ? "border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100"
                      : "border-white/30 text-white bg-transparent hover:bg-white/10"
                  }`}
                >
                  Become a Tutor
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/account">
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
                <a href={getLoginUrl()} className="w-full">
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
