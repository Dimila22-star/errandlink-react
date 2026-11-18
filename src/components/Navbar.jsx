import Logo from "./Logo";
import { Link } from "../context/RouterContext";

function Navbar() {
  const links = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/about", label: "About" },
    { href: "/reviews", label: "Reviews" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <nav>
      <Logo />
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
