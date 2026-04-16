import React, { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";

const Dashboard = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/stats");
        setStatsData(response.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      name: "Total Invoices",
      value: statsData?.total_invoices?.toString() || "0",
      icon: "📄",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Today's Revenue",
      value: `Rp ${(statsData?.today_revenue / 100 || 0).toLocaleString("id-ID")}`,
      icon: "💰",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Pending Approvals",
      value: statsData?.pending_approvals?.toString() || "0",
      icon: "⏳",
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Items in Stock",
      value: statsData?.items_in_stock?.toLocaleString() || "0",
      icon: "📦",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "Create New Invoice",
      description: "Generate a new shipping invoice or receipt.",
      link: "/wizard/step1",
      icon: "➕",
    },
    {
      title: "View History",
      description: "Track and manage previously generated invoices.",
      link: "/history",
      icon: "📖",
    },
  ];

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
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500">
          Here is what is happening with your logistics today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${stat.color}`}
              >
                {stat.icon}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.link}>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-white transition-colors">
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {action.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold">New Feature: Bulk Export</h3>
              <p className="text-indigo-100 mt-2 max-w-md">
                You can now export up to 100 invoices at once to Excel or PDF
                for monthly reporting.
              </p>
              <button className="mt-6 bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                Learn More
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-6 flex-1">
            {statsData?.recent_invoices?.length > 0 ? (
              statsData.recent_invoices.map((inv: any) => (
                <div key={inv.id} className="flex gap-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Invoice {inv.invoice_number} generated
                    </p>
                    <p className="text-xs text-slate-500">
                      To: {inv.receiver_name} •{" "}
                      {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">
                  No recent activity found.
                </p>
              </div>
            )}
          </div>
          <Link href="/history">
            <button className="w-full mt-8 py-2 text-indigo-600 text-sm font-bold border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors">
              View All History
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
