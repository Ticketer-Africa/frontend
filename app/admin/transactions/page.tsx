"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CreditCard,
  Search,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  Ticket,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import { useAdminTransactions } from "@/services/admin/admin.queries";
import { Transaction } from "@/types/admin.type";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const {
    data: transactions,
    isLoading,
    error: transactionsError,
  } = useAdminTransactions();

  const { isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser && !authLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    if (currentUser && !["ADMIN", "SUPERADMIN"].includes(currentUser.role)) {
      router.push("/explore");
      return;
    }
  }, [currentUser, authLoading, router]);

  // Transform real data to match required format
  const allTransactions = useMemo(() => {
    return (transactions ?? []).map((txn: Transaction) => ({
      ...txn,
      name: txn.user?.name ?? "Unknown User",
      email: txn.user?.email ?? "N/A",
      eventName: txn.event?.name ?? txn.type ?? "Transaction",
      ticketCount: txn.tickets?.length ?? 0,
      date: txn.createdAt,
      type: txn.type,
      reference: txn.reference ?? `PAY_${txn.id}`,
    }));
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((txn: Transaction) => {
        const matchesSearch =
          (txn.user?.name?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          ) ||
          (txn.user?.email?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          ) ||
          (txn.event?.name?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          ) ||
          (txn.reference?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          );

        const matchesStatus =
          statusFilter === "ALL" || txn.status === statusFilter;

        const matchesDate = () => {
          if (dateFilter === "ALL") return true;
          const txnDate = new Date(txn.date);
          const today = new Date();

          switch (dateFilter) {
            case "TODAY":
              return txnDate.toDateString() === today.toDateString();
            case "WEEK":
              const weekAgo = new Date(
                today.getTime() - 7 * 24 * 60 * 60 * 1000
              );
              return txnDate >= weekAgo;
            case "MONTH":
              const monthAgo = new Date(
                today.getTime() - 30 * 24 * 60 * 60 * 1000
              );
              return txnDate >= monthAgo;
            default:
              return true;
          }
        };

        return matchesSearch && matchesStatus && matchesDate();
      })
      .sort((a: any, b: any) => {
        let aValue, bValue;

        switch (sortBy) {
          case "amount":
            aValue = a.amount;
            bValue = b.amount;
            break;
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "event":
            aValue = a.event.toLowerCase();
            bValue = b.event.toLowerCase();
            break;
          default:
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
        }

        return sortOrder === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
  }, [
    allTransactions,
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,
  ]);

  // Calculate stats
  const totalRevenue = allTransactions.reduce(
    (sum: number, txn: Transaction) => sum + txn.amount,
    0
  );
  const successfulTransactions = allTransactions.filter(
    (txn: Transaction) => txn.status === "SUCCESS"
  ).length;
  const pendingTransactions = allTransactions.filter(
    (txn: Transaction) => txn.status === "PENDING"
  ).length;
  const failedTransactions = allTransactions.filter(
    (txn: Transaction) => txn.status === "FAILED"
  ).length;

  // Toggle row expansion for mobile
  const toggleRow = (txnId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(txnId)) {
      newExpanded.delete(txnId);
    } else {
      newExpanded.add(txnId);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 text-sm sm:text-base">
          Loading Transactions...
        </p>
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-sm sm:text-base">
          Error loading transactions: {transactionsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                <CreditCard className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                All Transactions
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Manage and monitor all platform transactions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs sm:text-sm">
                <RefreshCw className="h-3 sm:h-4 w-3 sm:w-4" />
                Refresh
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                <Download className="h-3 sm:h-4 w-3 sm:w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Revenue"
            value={`₦${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="green"
          />
          <StatCard
            title="Successful"
            value={successfulTransactions}
            icon={<CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="green"
          />
          <StatCard
            title="Pending"
            value={pendingTransactions}
            icon={<Clock className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="yellow"
          />
          <StatCard
            title="Failed"
            value={failedTransactions}
            icon={<XCircle className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 sm:h-4 w-3 sm:w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full hidden sm:table">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                    Transaction
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                    Customer
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">
                    Event
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden md:table-cell">
                    Amount
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                    Status
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.map((transaction: Transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                          #{transaction.id}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600">
                          {transaction.reference}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Ticket className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {transaction.ticketCount} tickets
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {transaction.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm sm:text-base">
                            {transaction.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {transaction.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <p className="font-medium text-slate-900 text-xs sm:text-sm">
                        {transaction.event?.name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {transaction.type}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                        ₦{transaction.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(transaction.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize ${
                          transaction.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status === "SUCCESS" && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {transaction.status === "PENDING" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {transaction.status === "FAILED" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card Layout */}
            <div className="sm:hidden divide-y divide-slate-200">
              {filteredTransactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {transaction.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          #{transaction.id}
                        </p>
                        <p className="text-xs text-slate-600">
                          {transaction.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRow(transaction.id)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  {expandedRows.has(transaction.id) && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {transaction.ticketCount} tickets
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {transaction.reference}
                      </p>
                      <p className="text-xs text-slate-600">
                        {transaction.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Event:</span>
                        <span className="text-xs font-medium text-slate-900">
                          {transaction.event?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Type:</span>
                        <span className="text-xs text-slate-600">
                          {transaction.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Amount:</span>
                        <span className="font-bold text-xs text-slate-900">
                          ₦{transaction.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <div>
                          <p className="text-xs font-medium text-slate-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(transaction.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            transaction.status === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status === "SUCCESS" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {transaction.status === "PENDING" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {transaction.status === "FAILED" && (
                            <XCircle className="h-3 w-3" />
                          )}
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-10 sm:h-12 w-10 sm:w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium text-sm sm:text-base">
                No transactions found
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 px-4 sm:px-0">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing {filteredTransactions.length} of {allTransactions.length}{" "}
            transactions
          </p>
        </div>
      </div>
    </div>
  );
}

type Color = "green" | "yellow" | "red" | "blue";

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: Color;
}) {
  const colorClasses: Record<Color, string> = {
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}


