import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { useInvoiceStoreHydrated } from "@/store/invoiceStore";
import { useDebounce } from "@/utils/debounce";
import axiosInstance from "@/lib/axiosInstance";
import Stepper from "@/components/Stepper";

interface SearchResult {
  id: number;
  code: string;
  name: string;
  price: number;
}

export default function Step2() {
  const router = useRouter();
  const store = useInvoiceStoreHydrated();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [searchCode, setSearchCode] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || "");
  }, []);

  const performSearch = useCallback(async (code: string) => {
    if (!code.trim()) {
      setSearchResults([]);
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsSearching(true);

    try {
      const response = await axiosInstance.get("/items", {
        params: { code },
        signal: abortControllerRef.current.signal,
      });

      setSearchResults(response.data.data || []);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useDebounce(performSearch, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchCode(value);
    debouncedSearch(value);
  };

  const handleAddItem = (item: SearchResult) => {
    const newItem = {
      itemId: item.id,
      code: item.code,
      name: item.name,
      quantity: selectedQuantity,
      price: item.price,
      subtotal: item.price * selectedQuantity,
    };

    const existingItem = store.items.find((i) => i.itemId === item.id);
    if (existingItem) {
      store.updateItem(item.id, {
        quantity: existingItem.quantity + selectedQuantity,
        subtotal:
          (existingItem.quantity + selectedQuantity) * existingItem.price,
      });
    } else {
      store.addItem(newItem);
    }

    setSearchCode("");
    setSearchResults([]);
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (itemId: number) => {
    store.removeItem(itemId);
  };

  const handlePrevious = () => {
    router.push("/wizard/step1");
  };

  const handleNext = () => {
    if (store.items.length === 0) {
      alert("Please add at least one item");
      return;
    }
    router.push("/wizard/step3");
  };

  const isKerani = userRole === "kerani";
  const totalAmount = store.items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <Stepper currentStep={2} />

      <div className="space-y-6">
        {/* Search Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Search Items
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={handleSearchChange}
                placeholder="Enter item code..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                ) : (
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="w-full md:w-32">
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Qty"
              />
            </div>
          </div>

          {/* Search Results Dropdown-like */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-inner">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-4 flex items-center justify-between hover:bg-white transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase mb-1 block">
                      {result.code}
                    </span>
                    <p className="font-semibold text-slate-800">
                      {result.name}
                    </p>
                    {!isKerani && (
                      <p className="text-sm font-medium text-slate-500">
                        Rp {(result.price / 100).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddItem(result)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    Add to List
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Added Items</h2>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
              {store.items.length} Items Selected
            </span>
          </div>

          <div className="min-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50 text-left">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Qty
                  </th>
                  {!isKerani && (
                    <>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Price
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Subtotal
                      </th>
                    </>
                  )}
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {store.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isKerani ? 3 : 5}
                      className="px-8 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-4xl">🛒</div>
                        <p className="text-slate-400 font-medium">
                          No items have been added yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  store.items.map((item) => (
                    <tr
                      key={item.itemId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-900">
                          {item.code}
                        </p>
                        <p className="text-sm text-slate-500">{item.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {item.quantity}
                        </span>
                      </td>
                      {!isKerani && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 font-medium">
                            Rp {(item.price / 100).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-bold">
                            Rp {(item.subtotal / 100).toLocaleString("id-ID")}
                          </td>
                        </>
                      )}
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-2"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!isKerani && store.items.length > 0 && (
                <tfoot className="bg-slate-50/50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-6 text-right text-sm font-bold text-slate-500 uppercase tracking-wider"
                    >
                      Grand Total
                    </td>
                    <td className="px-6 py-6 text-right whitespace-nowrap">
                      <span className="text-xl font-black text-indigo-600">
                        Rp {(totalAmount / 100).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="flex gap-4 pt-4 no-print">
          <button
            onClick={handlePrevious}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Back to Client Info
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
          >
            Review & Finish
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
  );
}
