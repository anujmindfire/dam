import { useState, useEffect, memo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { Button } from "./Button";
import type { AppListProps } from "../../types";

export const AppList = memo(
  <T extends { id: string | number }>({
    columns,
    rows,
    count,
    page,
    setPage,
    limit,
    setLimit,
    loading,
    onSearch,
    addButton,
    renderRow,
  }: AppListProps<T>) => {
    const [search, setSearch] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        onSearch?.(search);
      }, 500);
      return () => clearTimeout(timer);
    }, [search, onSearch]);

    const totalPages = Math.ceil(count / limit);

    return (
      <div className="w-full text-[var(--text-color)] animate-in fade-in duration-500">
        {/* Search & Action Bar */}
        <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-[var(--border)]">
          <div className="relative w-full max-w-2xl group">
            <input
              type="text"
              placeholder="Search Assets, Users, and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] w-4 h-4 transition-colors" />
          </div>
          {addButton && <div className="ml-4 flex-shrink-0">{addButton}</div>}
        </div>

        {/* Table Container */}
        <div className="mt-6 rounded-2xl bg-white overflow-hidden border border-[var(--border)] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50/50 border-b border-[var(--border)]">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-widest"
                      style={{
                        width: col.width ? `${col.width}%` : "auto",
                        textAlign: col.align || "left",
                      }}
                    >
                      <div
                        className={`flex items-center gap-2 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : ""}`}
                      >
                        {col.label}
                        {col.sortable && <ArrowDown className="w-3.5 h-3.5 opacity-30" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Fetching Data
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 opacity-40">
                        <Search size={32} />
                        <p className="text-sm font-bold uppercase tracking-widest">
                          No matching records
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {columns.map((col) => (
                        <td
                          key={`${row.id}-${col.id}`}
                          className="px-6 py-4.5 text-sm"
                          style={{ textAlign: col.align || "left" }}
                        >
                          {renderRow(row, col.id)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {count > 0 && (
          <div className="flex flex-wrap justify-end items-center mt-8 gap-6">
            <div className="flex items-center gap-3">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Show Rows:
              </label>
              <select
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold outline-none cursor-pointer hover:border-[var(--primary)] transition-colors"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-500 font-bold tracking-tight">
              {(page - 1) * limit + 1}-{Math.min(page * limit, count)}{" "}
              <span className="mx-1 text-slate-300">of</span> {count}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);
