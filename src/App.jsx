import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import Reviews from "./components/Reviews";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ReviewDetail from "./components/ReviewDetail";
import Register from "./components/Register";
import Errands from "./components/Errands";
import { Link, useRouter } from "./context/RouterContext";

function App() {
  const { pathname } = useRouter();
  const reviewMatch = pathname.match(/^\/reviews\/([^/]+)\/?$/);

  if (reviewMatch) {
    return <ReviewDetail reviewId={decodeURIComponent(reviewMatch[1])} />;
  }

  if (pathname === "/about") {
    return (
      <>
        <Navbar />
        <main>
          <About />
        </main>
        <Footer />
      </>
    );
  }

  if (pathname === "/reviews") {
    return (
      <>
        <Navbar />
        <main>
          <Reviews />
        </main>
        <Footer />
      </>
    );
  }

  if (pathname === "/register" || pathname === "/login") {
    return (
      <>
        <Navbar />
        <Register mode={pathname === "/login" ? "login" : "register"} />
        <Footer />
      </>
    );
  }

  if (pathname === "/errands") {
    return (
      <>
        <Navbar />
        <Errands />
        <Footer />
      </>
    );
  }

  if (pathname !== "/") {
    return (
      <>
        <Navbar />
        <main className="detail-page">
          <h1>Page not found</h1>
          <Link to="/" className="text-link">Return to ErrandLink</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <About />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
