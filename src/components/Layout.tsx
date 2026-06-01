import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import usePageviewTracker from "@/hooks/usePageviewTracker";

// Global shell: fixed header + per-route content + footer, shared across all routes.
function Layout() {
  usePageviewTracker();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollToTop />
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}

export default Layout;
