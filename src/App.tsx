import { lazy, Suspense, useEffect } from "react";
import { matchPath, useLocation } from "./lib/router";
import { PageLoader } from "./components/ui/Site";

const Home = lazy(() => import("./pages/Home"));
const Demo = lazy(() => import("./pages/Demo"));
const Invite = lazy(() => import("./pages/Invite"));
const Builder = lazy(() => import("./pages/Builder"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OgPreview = import.meta.env.DEV ? lazy(() => import("./pages/OgPreview")) : null;

function Routes() {
  const { path } = useLocation();
  let m: Record<string, string> | null;
  if (path === "/") return <Home />;
  if ((m = matchPath("/i/:slug", path))) return <Invite key={m.slug} slug={m.slug} />;
  if ((m = matchPath("/namuna/:template", path))) return <Demo key={m.template} template={m.template} />;
  if (path === "/yaratish") return <Builder />;
  if ((m = matchPath("/buyurtma/:id", path))) return <OrderStatus key={m.id} id={m.id} />;
  if (path === "/admin") return <Admin />;
  if (OgPreview && (m = matchPath("/__og/:id", path))) return <OgPreview id={m.id} />;
  return <NotFound />;
}

export default function App() {
  const { path, hash } = useLocation();
  // Scroll to in-page anchors after lazy pages mount (e.g. "/#narxlar").
  useEffect(() => {
    if (!hash) return;
    let tries = 0;
    const t = window.setInterval(() => {
      const el = document.querySelector(hash);
      if (el || ++tries > 40) window.clearInterval(t);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => window.clearInterval(t);
  }, [path, hash]);
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes />
    </Suspense>
  );
}
