import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import Cookies from "js-cookie";

interface Invoice {
  id: number;
  invoice_number: string;
  sender_name: string;
  receiver_name: string;
  total_amount: number;
  created_at: string;
  created_by: string;
}

const HistoryPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "");

    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get("/invoices");
        setInvoices(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const isKerani = userRole === "kerani";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoice History</h1>
        <p className="text-slate-500">
          View and manage all previously generated logistics invoices.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50 text-left">
              <tr>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Parties (From / To)
                </th>
                {!isKerani && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Amount
                  </th>
                )}
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Issuer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={isKerani ? 4 : 5}
                    className="px-8 py-12 text-center text-slate-400"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-600">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(inv.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900">
                          {inv.sender_name}
                        </span>
                        <span className="mx-2 text-slate-300">→</span>
                        <span className="font-semibold text-slate-900">
                          {inv.receiver_name}
                        </span>
                      </div>
                    </td>
                    {!isKerani && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                        Rp {(inv.total_amount / 100).toLocaleString("id-ID")}
                      </td>
                    )}
                    <td className="px-8 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {inv.created_by.split("_")[0]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
