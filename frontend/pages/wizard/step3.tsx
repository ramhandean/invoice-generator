import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useInvoiceStoreHydrated } from "@/store/invoiceStore";
import { filterPayloadByRole } from "@/utils/payloadFilter";
import axiosInstance from "@/lib/axiosInstance";
import Stepper from "@/components/Stepper";

export default function Step3() {
  const router = useRouter();
  const store = useInvoiceStoreHydrated();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "");

    if (!invoiceNumber) {
      const timestamp = new Date().getTime().toString().slice(-6);
      setInvoiceNumber(`INV-${timestamp}`);
    }
  }, [invoiceNumber]);

  const calculateTotalAmount = (): number => {
    return store.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!store.step1Data.senderName || !store.step1Data.receiverName) {
      setError("Please complete Step 1 first");
      return;
    }

    if (store.items.length === 0) {
      setError("Please add items in Step 2");
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotalAmount();

      let payload: any = {
        invoice_number: invoiceNumber,
        sender_name: store.step1Data.senderName,
        sender_address: store.step1Data.senderAddress,
        receiver_name: store.step1Data.receiverName,
        receiver_address: store.step1Data.receiverAddress,
        total_amount: totalAmount,
        details: store.items.map((item) => ({
          item_id: item.itemId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
      };

      payload = filterPayloadByRole(payload);
      await axiosInstance.post("/invoices", payload);

      setSuccessMessage("Invoice successfully generated and sent to system!");

      setTimeout(() => {
        store.reset();
        router.push("/");
      }, 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to create invoice. Please check your connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isKerani = userRole === "kerani";
  const totalAmount = calculateTotalAmount();

  return (
    <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
      <div className="no-print">
        <Stepper currentStep={3} />
      </div>

      <div className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl no-print">
            <div className="flex items-center gap-3 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-bold text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl no-print">
            <div className="flex items-center gap-3 text-emerald-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-bold text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Invoice Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-0 print:shadow-none print:rounded-none">
          {/* Invoice Header / Letterhead */}
          <div className="bg-slate-900 text-white p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:bg-white print:text-slate-900 print:px-0 print:py-2 print:border-b-2 print:border-slate-900">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl print:bg-slate-900">
                  F
                </div>
                <h1 className="text-2xl font-black tracking-tight uppercase">
                  Fleetify Logistics
                </h1>
              </div>
              <p className="text-slate-400 text-sm print:text-slate-500">
                Premium Freight & Distribution Services
              </p>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-light tracking-widest uppercase opacity-50 mb-1 print:text-2xl print:opacity-100 print:font-bold">
                INVOICE
              </h2>
              <p className="text-indigo-400 font-bold tracking-tighter print:text-slate-900">
                {invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Date: {new Date().toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          <div className="p-10 space-y-10 print:px-0 print:py-2 print:space-y-3">
            {/* Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-0 print:p-0">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  From / Pengirim
                </h3>
                <p className="text-lg font-bold text-slate-900 mb-1">
                  {store.step1Data.senderName}
                </p>
                <div className="h-px bg-slate-200 w-12 my-3 print:hidden"></div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {store.step1Data.senderAddress || "No address provided"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 print:bg-white print:border-0 print:p-0">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  To / Penerima
                </h3>
                <p className="text-lg font-bold text-slate-900 mb-1">
                  {store.step1Data.receiverName}
                </p>
                <div className="h-px bg-slate-200 w-12 my-3 print:hidden"></div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {store.step1Data.receiverAddress || "No address provided"}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b-2 border-slate-900">
                    <th className="py-4 print:py-1.5 text-xs font-black text-slate-900 uppercase">
                      Description
                    </th>
                    <th className="py-4 print:py-1.5 text-xs font-black text-slate-900 uppercase text-center">
                      Qty
                    </th>
                    {!isKerani && (
                      <>
                        <th className="py-4 print:py-1.5 text-xs font-black text-slate-900 uppercase text-right">
                          Unit Price
                        </th>
                        <th className="py-4 print:py-1.5 text-xs font-black text-slate-900 uppercase text-right">
                          Amount
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {store.items.map((item) => (
                    <tr key={item.itemId}>
                      <td className="py-5 print:py-1.5">
                        <p className="font-bold text-slate-900 print:text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-1 print:hidden">
                          {item.code}
                        </p>
                      </td>
                      <td className="py-5 print:py-1.5 text-center font-bold text-slate-900 print:text-sm">
                        {item.quantity}
                      </td>
                      {!isKerani && (
                        <>
                          <td className="py-5 print:py-1.5 text-right text-slate-600 print:text-sm">
                            Rp {(item.price / 100).toLocaleString("id-ID")}
                          </td>
                          <td className="py-5 print:py-1.5 text-right font-bold text-slate-900 print:text-sm">
                            Rp {(item.subtotal / 100).toLocaleString("id-ID")}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                {!isKerani && (
                  <tfoot>
                    <tr>
                      <td
                        colSpan={3}
                        className="pt-10 print:pt-4 pb-2 text-right text-xs font-bold text-slate-500 uppercase tracking-tighter"
                      >
                        Subtotal
                      </td>
                      <td className="pt-10 print:pt-4 pb-2 text-right font-bold text-slate-900">
                        Rp {(totalAmount / 100).toLocaleString("id-ID")}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        className="py-2 text-right text-xs font-bold text-slate-500 uppercase tracking-tighter"
                      >
                        Tax (0%)
                      </td>
                      <td className="py-2 text-right font-bold text-slate-900">
                        Rp 0
                      </td>
                    </tr>
                    <tr className="border-t-2 border-slate-900">
                      <td
                        colSpan={3}
                        className="py-6 print:py-2 text-right text-sm font-black text-slate-900 uppercase italic"
                      >
                        Total Amount Due
                      </td>
                      <td className="py-6 print:py-2 text-right text-2xl font-black text-indigo-600">
                        Rp {(totalAmount / 100).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Print Footer */}
            <div className="flex flex-col md:flex-row print:flex-row justify-between items-end gap-12 pt-10 border-t border-slate-100 print:pt-4 print:gap-8 print:border-slate-900 break-inside-avoid">
              <div className="flex-1 print:max-w-[60%]">
                <p className="text-xs font-bold text-slate-900 uppercase mb-4 print:mb-2 tracking-widest">
                  Notes & Terms
                </p>
                <p className="text-[10px] text-slate-400 leading-normal print:text-[8px] print:leading-tight">
                  Goods received in good condition. All claims must be made
                  within 24 hours of delivery. This is a computer generated
                  invoice and does not require a physical signature.
                </p>
              </div>
              <div className="text-center min-w-[200px]">
                <div className="w-full h-24 print:h-12 border-b border-slate-200 mb-2 flex items-end justify-center pb-2 opacity-20 print:border-slate-400 print:opacity-100">
                  <span className="text-[10px] text-slate-300 transform rotate-12 print:text-slate-400">
                    Authorized Signature
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest print:text-[8px]">
                  Fleetify Authorized Agent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 py-8 no-print">
          <div className="flex w-full gap-4">
            <button
              onClick={() => router.push("/wizard/step2")}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              Back to Items
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              disabled={isSubmitting}
            >
              Print Invoice
              <svg
                className="w-5 h-5 group-hover:-translate-y-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 animate-pulse-subtle"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "FINALIZE & SUBMIT INVOICE"
            )}
          </button>
          <p className="text-xs text-slate-400 font-medium">
            By clicking submit, this invoice will be recorded in the history
            log.
          </p>
        </div>
      </div>
    </div>
  );
}
