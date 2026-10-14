import React, { useState } from 'react';
import { X, Ruler, Check, Info } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: number;
  onSelectSize?: (size: number) => void;
}

interface SizeRow {
  uk: number;
  usMen: number;
  usWomen: number;
  eu: number;
  cm: number;
  inches: string;
}

export const SIZE_CONVERSIONS: SizeRow[] = [
  { uk: 5, usMen: 5.5, usWomen: 7, eu: 38, cm: 24.0, inches: '9.4"' },
  { uk: 6, usMen: 6.5, usWomen: 8, eu: 39.5, cm: 24.8, inches: '9.8"' },
  { uk: 7, usMen: 7.5, usWomen: 9, eu: 40.5, cm: 25.5, inches: '10.0"' },
  { uk: 8, usMen: 8.5, usWomen: 10, eu: 42, cm: 26.5, inches: '10.4"' },
  { uk: 9, usMen: 9.5, usWomen: 11, eu: 43, cm: 27.5, inches: '10.8"' },
  { uk: 10, usMen: 10.5, usWomen: 12, eu: 44.5, cm: 28.5, inches: '11.2"' },
  { uk: 11, usMen: 11.5, usWomen: 13, eu: 46, cm: 29.5, inches: '11.6"' },
  { uk: 12, usMen: 12.5, usWomen: 14, eu: 47, cm: 30.5, inches: '12.0"' },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
}) => {
  const [activeUnit, setActiveUnit] = useState<'cm' | 'inches'>('cm');
  const [genderView, setGenderView] = useState<'men' | 'women'>('men');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#F5F1E8] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#DFD8CC] relative animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E2DC CF] flex items-center justify-between bg-[#EFEAE0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E5DECE] border border-[#D5CDBC] flex items-center justify-center text-[#171715]">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="size-guide-title"
                className="font-display font-bold text-base sm:text-lg tracking-wide uppercase text-[#171715]"
              >
                Footwear Size Guide
              </h2>
              <p className="text-[11px] sm:text-xs text-[#7A7569]">
                Compare UK, US, and EU footwear sizes for SOLEFORM silhouettes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1.5 sm:p-2 text-[#7A7569] hover:text-[#171715] rounded-full hover:bg-[#E2DCCF] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Controls: Gender toggle & Unit toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="inline-flex p-1 rounded-lg bg-[#E5DECE] border border-[#D5CDBC]">
              <button
                type="button"
                onClick={() => setGenderView('men')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  genderView === 'men'
                    ? 'bg-[#171715] text-[#F5F1E8] shadow-xs'
                    : 'text-[#5E5A50] hover:text-[#171715]'
                }`}
              >
                Men's Sizing
              </button>
              <button
                type="button"
                onClick={() => setGenderView('women')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  genderView === 'women'
                    ? 'bg-[#171715] text-[#F5F1E8] shadow-xs'
                    : 'text-[#5E5A50] hover:text-[#171715]'
                }`}
              >
                Women's Sizing
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#7A7569]">
              <span className="font-medium text-[#5E5A50]">Foot Length:</span>
              <div className="inline-flex p-0.5 rounded-md bg-[#E5DECE] border border-[#D5CDBC]">
                <button
                  type="button"
                  onClick={() => setActiveUnit('cm')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    activeUnit === 'cm'
                      ? 'bg-[#171715] text-[#F5F1E8]'
                      : 'text-[#5E5A50] hover:text-[#171715]'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUnit('inches')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    activeUnit === 'inches'
                      ? 'bg-[#171715] text-[#F5F1E8]'
                      : 'text-[#5E5A50] hover:text-[#171715]'
                  }`}
                >
                  IN
                </button>
              </div>
            </div>
          </div>

          {/* Size Comparison Table */}
          <div className="rounded-xl overflow-hidden border border-[#DCD5C5] bg-[#FAF8F3] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EBE5DA] border-b border-[#DDD6C8] text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#171715]">
                    <th className="py-3 px-3.5 sm:px-4 text-center">UK / IND</th>
                    <th className="py-3 px-3.5 sm:px-4 text-center">
                      {genderView === 'men' ? 'US Men' : 'US Women'}
                    </th>
                    <th className="py-3 px-3.5 sm:px-4 text-center">EU</th>
                    <th className="py-3 px-3.5 sm:px-4 text-center">
                      Foot Length ({activeUnit.toUpperCase()})
                    </th>
                    {onSelectSize && (
                      <th className="py-3 px-3.5 sm:px-4 text-center">Select</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D7] text-xs sm:text-sm text-[#2D2A24]">
                  {SIZE_CONVERSIONS.map((row) => {
                    const isSelected = selectedSize === row.uk;
                    const usSize = genderView === 'men' ? row.usMen : row.usWomen;

                    return (
                      <tr
                        key={row.uk}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-[#E3DC CE]/70 font-semibold text-[#171715]'
                            : 'hover:bg-[#F0EBE0]'
                        }`}
                      >
                        <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md ${
                              isSelected
                                ? 'bg-[#171715] text-[#F5F1E8]'
                                : 'bg-[#E8E2D5] text-[#171715] font-semibold'
                            }`}
                          >
                            UK {row.uk}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-center font-medium">
                          {usSize}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-center font-medium">
                          {row.eu}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-center text-[#5E5A50]">
                          {activeUnit === 'cm' ? `${row.cm.toFixed(1)} cm` : row.inches}
                        </td>
                        {onSelectSize && (
                          <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-center">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A6B3A] uppercase tracking-wide">
                                <Check className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSize(row.uk);
                                  onClose();
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border border-[#CDC5B4] text-[#171715] hover:bg-[#171715] hover:text-[#F5F1E8] hover:border-[#171715] transition-all cursor-pointer"
                              >
                                Choose
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measuring Instructions & Fit Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#EBE5DA] border border-[#DDD6C8] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171715]">
                <Info className="w-3.5 h-3.5 text-[#7A7569]" />
                <span>Fit Recommendation</span>
              </div>
              <p className="text-xs text-[#5E5A50] leading-relaxed">
                SOLEFORM silhouettes feature an engineered ergonomic toe-box designed for standard to slightly relaxed volume. They fit <strong>true to size</strong>. If you are between half sizes, we recommend sizing up to the next full UK size.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EBE5DA] border border-[#DDD6C8] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171715]">
                <Ruler className="w-3.5 h-3.5 text-[#7A7569]" />
                <span>How to Measure</span>
              </div>
              <p className="text-xs text-[#5E5A50] leading-relaxed">
                Stand on a sheet of paper against a wall with socks on. Mark the tip of your longest toe and back of your heel, then measure the distance in centimeters to match the chart.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-[#EFEAE0] border-t border-[#E2DCCF] flex items-center justify-between">
          <span className="text-[11px] text-[#7A7569]">
            Complimentary 30-day size exchanges on all orders
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#171715] text-[#F5F1E8] hover:bg-black transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
