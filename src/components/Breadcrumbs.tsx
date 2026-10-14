import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="w-full bg-[#EFE9DC]/80 backdrop-blur-xs border-b border-[#E5DECة] border-[#E2D9C8] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 sm:gap-2">
                {item.onClick && !isLast ? (
                  <button
                    onClick={item.onClick}
                    className="text-[#6B6557] hover:text-[#171715] font-medium tracking-wide transition-colors cursor-pointer uppercase inline-flex items-center"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={`${
                      isLast
                        ? 'text-[#171715] font-semibold tracking-wide truncate max-w-[200px] sm:max-w-none'
                        : 'text-[#6B6557] font-medium uppercase'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <ChevronRight
                    className="w-3 h-3 text-[#A8A190] shrink-0 stroke-[2]"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
