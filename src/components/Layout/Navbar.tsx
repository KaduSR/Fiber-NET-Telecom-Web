import React, { useState, useEffect } from "react";
import { Menu, X, Headphones, FileText } from "lucide-react";
import { NAV_ITEMS } from "../../constants";
import Button from "./Button";
import FiberNetLogo from "./FiberNetLogo";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenSupport?: () => void;
  onOpenSegundaVia?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenSupport,
  onOpenSegundaVia,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (href === "segunda-via") {
      if (onOpenSegundaVia) onOpenSegundaVia();
      setIsOpen(false);
      return;
    }

    // Handle external links
    if (href.startsWith("http")) {
      window.open(href, "_blank");
      setIsOpen(false);
      return;
    }

    if (href.startsWith("#")) {
      if (currentPage !== "home") {
        onNavigate("home");
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      onNavigate(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const isLinkActive = (href: string) => {
    if (
      href.startsWith("#") ||
      href.startsWith("http") ||
      href === "segunda-via"
    )
      return false;
    return currentPage === href;
  };

  // Dynamic classes for the navbar background transition
  const navbarClasses =
    isScrolled || isOpen || currentPage !== "home"
      ? "bg-neutral-950/80 backdrop-blur-lg border-b border-white/5 py-3 shadow-md"
      : "bg-transparent border-b border-transparent py-5";

  return (
    <nav
      role="navigation"
      aria-label="Menu principal"
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${navbarClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo - Adjusted size for elegance */}
          <button
            className="flex items-center cursor-pointer select-none focus:outline-none opacity-100 hover:opacity-90 transition-opacity"
            onClick={() => onNavigate("home")}
            aria-label="Ir para a página inicial da Fiber.Net"
          >
            <FiberNetLogo className="h-10 sm:h-12" />
          </button>

          {/* Desktop Menu - Cleaner Look */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center space-x-5">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  aria-current={isLinkActive(item.href) ? "page" : undefined}
                  className={`text-sm font-medium transition-all relative group py-2 ${
                    isLinkActive(item.href)
                      ? "text-fiber-orange drop-shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                      : "text-gray-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                  }`}
                >
                  {item.label}
                  {/* Active/Hover Indicator */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-fiber-orange transform origin-left transition-transform duration-300 shadow-[0_0_8px_rgba(255,107,0,0.8)] ${
                      isLinkActive(item.href)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <button
                onClick={onOpenSupport}
                className="text-gray-400 hover:text-fiber-orange transition-colors focus:outline-none"
                title="Suporte"
                aria-label="Abrir central de suporte"
              >
                <Headphones size={20} />
              </button>

              <Button
                variant="primary"
                className="!py-2 !px-5 text-xs font-bold uppercase tracking-wider rounded-full"
                onClick={() => onNavigate("client-area")}
              >
                Área do Cliente
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={onOpenSupport}
              className="text-gray-400 hover:text-fiber-orange p-1"
              aria-label="Suporte Rápido"
            >
              <Headphones size={22} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-1"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              aria-current={isLinkActive(item.href) ? "page" : undefined}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                isLinkActive(item.href)
                  ? "text-fiber-orange bg-white/5 border-l-4 border-fiber-orange pl-3"
                  : "text-gray-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
              }`}
            >
              {item.label}
            </a>
          ))}

          <div className="h-px bg-white/10 my-4 mx-4"></div>

          <div className="px-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSupport) onOpenSupport();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-neutral-800 text-white border border-white/10 hover:bg-neutral-700 transition-colors"
            >
              <Headphones size={18} /> Suporte
            </button>
            <Button
              variant="primary"
              fullWidth
              className="!rounded-lg !text-sm"
              onClick={() => {
                setIsOpen(false);
                onNavigate("client-area");
              }}
            >
              Área do Cliente
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
