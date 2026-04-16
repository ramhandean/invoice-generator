import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useInvoiceStoreHydrated } from "../store/invoiceStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isHydrated } = useInvoiceStoreHydrated();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    // Pages that don't require the persistent dashboard layout
    const isPublicPage = router.pathname === "/login";

    if (!token && !isPublicPage) {
      router.push("/login");
      setIsAuthorized(false);
    } else if (token && isPublicPage) {
      router.push("/");
      setIsAuthorized(true);
    } else {
      setIsAuthorized(true);
    }
  }, [router.pathname]);

  // Handle Hydration for Zustand Persist
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">
            Initializing logistics platform...
          </p>
        </div>
      </div>
    );
  }

  // Hide Layout for public pages
  if (router.pathname === "/login") {
    return <>{children}</>;
  }

  if (isAuthorized === false) {
    return null; // Redirecting...
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 pb-16 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
