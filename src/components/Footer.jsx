import Logo from "./Logo";
import { Link } from "../context/RouterContext";

function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Logo light />
          <p>Fresh market goods, sourced fairly and delivered to you.</p>
        </div>

        <ul className="footer-links">
          <li>
            <Link to="/#how-it-works">How it works</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/reviews">Reviews</Link>
          </li>
          <li>
            <Link to="/#contact">Contact</Link>
          </li>
        </ul>
      </div>

     <div className="footer-bottom">
  <p>© {new Date().getFullYear()} ErrandLink. All rights reserved.</p>
  <a href="#top" onClick={(event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}>Back to top ↑</a>
</div>
    </footer>
  );
}

export default Footer;