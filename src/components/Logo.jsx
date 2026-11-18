import { Link } from "../context/RouterContext";

function Logo({ light = false }) {
  return (
    <Link to="/" className={light ? "logo logo-light" : "logo"}>
       <img src="/logo.jpg" alt="ErrandLink logo" className="logo-img" />
       <span>ErrandLink</span>
    </Link>
  );
}

export default Logo;