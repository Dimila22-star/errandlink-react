import { useState } from "react";
import Logo from "./Logo";
import { Link, useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/about", label: "About" },
    { href: "/reviews", label: "Reviews" },
    { href: "/#contact", label: "Contact" },
    { href: "/errands", label: "Errands" },
  ];

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav>
      <Logo />
      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>
      <ul className={menuOpen ? "nav-links nav-links-open" : "nav-links"}>
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} onClick={closeMenu}>{link.label}</Link>
          </li>
        ))}
        {user ? (
          <li>
            <button type="button" className="nav-button" onClick={handleLogout}>
              Sign out
            </button>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-account" onClick={closeMenu}>Sign in</Link>
            </li>
            <li>
              <Link to="/register" className="nav-account" onClick={closeMenu}>Sign up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
