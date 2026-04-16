import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useInvoiceStore } from "../store/invoiceStore";

const Header = () => {
  const router = useRouter();
  const resetStore = useInvoiceStore((state) => state.reset);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const role = Cookies.get("role");
    // For demo purposes, we'll map the role to a name if not available
    const name = role === "admin" ? "Administrator" : "Staff Logistics";
    setUser({ name, role: role || "Unknown" });
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    resetStore();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-800">
          {router.pathname === "/"
            ? "Dashboard"
            : router.pathname.startsWith("/wizard")
              ? "Create New Invoice"
              : router.pathname === "/history"
                ? "Invoice History"
                : ""}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs font-medium text-slate-500 capitalize">
              {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold border border-slate-200">
            {user?.name?.[0]}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
