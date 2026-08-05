import React, { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  colorClass?: string;
  hoverBgClass?: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  placeholder: string;
  id: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  className?: string;
  searchable?: boolean;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  id,
  activeId,
  setActiveId,
  className,
  searchable = false,
}: FilterSelectProps) {
  const isOpen = activeId === id;
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const displayColor = selectedOption
    ? selectedOption.colorClass
    : "text-neutral-700";

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (activeId === id) setActiveId(null);
      }
    };
    if (isOpen) {
      window.addEventListener("click", handleOutside);
      if (searchable) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      setSearchTerm("");
    }
    return () => window.removeEventListener("click", handleOutside);
  }, [isOpen, activeId, id, setActiveId, searchable]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setActiveId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setActiveId]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full relative flex flex-col", className)}
    >
      {label && (
        <span className="block text-[10px] font-bold text-mid-gray uppercase tracking-wider mb-1.5 select-none">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setActiveId(isOpen ? null : id)}
        className="w-full h-10 px-3 text-xs bg-paper border border-hairline rounded-lg hover:border-mid-gray/40 focus:ring-1 focus:ring-mid-gray/40 outline-none flex items-center justify-between transition-all cursor-pointer text-left shadow-subtle font-medium text-ink"
      >
        <span className={cn("truncate font-semibold", displayColor)}>
          {displayLabel}
        </span>
        <svg
          className={cn(
            "w-3 h-3 text-mid-gray shrink-0 transition-transform duration-200 ml-1.5",
            isOpen && "rotate-180",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-[62px] z-20 min-w-full w-max bg-paper border border-hairline rounded-xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col max-h-72 overflow-hidden animate-in fade-in duration-100">
          {searchable && (
            <div className="px-2 pb-1.5 mb-1.5 border-b border-hairline shrink-0">
              <input
                ref={inputRef}
                type="text"
                className="w-full h-8 px-2 text-xs bg-canvas border border-hairline rounded focus:outline-none focus:border-ink transition-colors text-ink placeholder:text-mid-gray/50"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto custom-scrollbar flex flex-col flex-1">
            {options
              .filter(
                (opt) =>
                  !searchable ||
                  opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setActiveId(null);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs rounded-md transition-colors font-medium cursor-pointer border-none bg-transparent flex items-center justify-between",
                      opt.colorClass,
                      isSelected
                        ? "bg-neutral-50 font-semibold text-ink"
                        : opt.hoverBgClass,
                    )}
                  >
                    <span className="whitespace-nowrap pr-4">{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-ink shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            {searchable &&
              options.filter((opt) =>
                opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
              ).length === 0 && (
                <div className="px-3 py-2 text-xs text-mid-gray text-center italic">
                  Không tìm thấy
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
