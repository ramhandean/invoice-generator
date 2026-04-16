import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useInvoiceStoreHydrated } from "@/store/invoiceStore";
import Stepper from "@/components/Stepper";

export default function Step1() {
  const router = useRouter();
  const store = useInvoiceStoreHydrated();
  const [formData, setFormData] = useState({
    senderName: "",
    senderAddress: "",
    receiverName: "",
    receiverAddress: "",
  });

  useEffect(() => {
    if (store.isHydrated) {
      setFormData(store.step1Data);
    }
  }, [store.isHydrated]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (!formData.senderName || !formData.receiverName) {
      alert("Sender and Receiver names are required.");
      return;
    }
    store.setStep1Data(formData);
    router.push("/wizard/step2");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Stepper currentStep={1} />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
          <h1 className="text-xl font-bold text-slate-900">
            Client Information
          </h1>
          <p className="text-sm text-slate-500">
            Provide details for both the sender and the recipient.
          </p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sender Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px]">
                  1
                </span>
                Sender Details
              </h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe / PT Logistics"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  placeholder="Street address, city, postal code"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Receiver Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px]">
                  2
                </span>
                Receiver Details
              </h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Smith / PT Retail"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  placeholder="Delivery address details"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 group"
            >
              Continue to Items
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
