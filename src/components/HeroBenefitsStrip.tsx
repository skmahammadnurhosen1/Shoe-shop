import React from 'react';
import { Gem, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroBenefitsStrip: React.FC = () => {
  return (
    <section className="w-full bg-[#F5F1E8] border-b border-[#E8E2D5] py-6 sm:py-7 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E2DDD0]">
          
          {/* Benefit 1 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 px-2 sm:px-6 lg:px-8 pb-4 sm:pb-0"
          >
            <div className="text-[#171715] shrink-0">
              <svg
                className="w-6 h-6 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.5 15.5l2.5-3.5 4.5 1 4-5.5 6 3v5.5H3.5z" />
                <path d="M3.5 18.5h17" />
                <path d="M10.5 13l2.5 3" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-[#171715]">
                MODERN STYLE
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A7569] leading-tight mt-0.5 font-normal">
                for every occasion
              </p>
            </div>
          </motion.div>

          {/* Benefit 2 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 px-2 sm:px-6 lg:px-8 py-4 sm:py-0"
          >
            <div className="text-[#171715] shrink-0">
              <Gem className="w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[1.6]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-[#171715]">
                VERSATILE WEAR
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A7569] leading-tight mt-0.5 font-normal">
                work, city, weekend
              </p>
            </div>
          </motion.div>

          {/* Benefit 3 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 px-2 sm:px-6 lg:px-8 pt-4 sm:pt-0"
          >
            <div className="text-[#171715] shrink-0">
              <Heart className="w-5.5 h-5.5 sm:w-6 sm:h-6 stroke-[1.6]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider text-[#171715]">
                MADE FOR YOU
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7A7569] leading-tight mt-0.5 font-normal">
                everyday confidence
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
