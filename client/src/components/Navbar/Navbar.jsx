import { useEffect, useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { Brain } from "lucide-react";
const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Why Sematrix", href: "#why" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar-scroll" : ""}`}>
        <div className="navbar-logo">
          <Brain size={30} />
          <span>Sematrix</span>
        </div>

        <nav className="navbar-links">
          {navLinks.map((item) => (
            <a key={item.name} href={item.href}>
              {item.name}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/register" className="register-btn">
            Get Started
          </Link>
        </div>

        <button className="mobile-btn" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <div className={`mobile-menu ${open ? "show" : ""}`}>
        {navLinks.map((item) => (
          <a key={item.name} href={item.href} onClick={() => setOpen(false)}>
            {item.name}
          </a>
        ))}

        <Link to="/login" onClick={() => setOpen(false)} className="mobile-login-btn">Login</Link>

        <Link to="/register" onClick={() => setOpen(false)} className="mobile-register-btn">Get Started</Link>
      </div>
    </>
  );
}
