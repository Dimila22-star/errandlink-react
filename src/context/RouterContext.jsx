import { createContext, useContext, useEffect, useState } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function updatePath() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  function navigate(to) {
    window.history.pushState({}, "", to);
    setPathname(window.location.pathname);

    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }),
      );
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const router = useContext(RouterContext);

  if (!router) throw new Error("useRouter must be used within RouterProvider");
  return router;
}

export function Link({ to, children, ...props }) {
  const { navigate } = useRouter();

  function handleClick(event) {
    props.onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
