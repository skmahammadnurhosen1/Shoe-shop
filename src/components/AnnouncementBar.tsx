import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ANNOUNCEMENTS } from '../data/shoes';

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((curr) => (curr === 0 ? ANNOUNCEMENTS.length - 1 : curr - 1));
  };

  const next = () => {
    setIndex((curr) => (curr === ANNOUNCEMENTS.length - 1 ? 0 : curr + 1));
  };

  return (
    <div className="bg-[#171715] text-[#F5F1E8] text-[11px] sm:text-xs tracking-[0.16em] uppercase py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={prev}
          aria-label="Previous announcement"
          className="text-[#9E9B93] hover:text-[#F5F1E8] transition-colors p-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="font-semibold text-center tracking-[0.18em] transition-opacity duration-300 select-none">
          {ANNOUNCEMENTS[index]}
        </div>

        <button
          onClick={next}
          aria-label="Next announcement"
          className="text-[#9E9B93] hover:text-[#F5F1E8] transition-colors p-1"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
