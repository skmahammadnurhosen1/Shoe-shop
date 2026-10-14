import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export const BenefitsStrip: React.FC = () => {
  return (
    <section className="bg-[#F5F1E8] border-y border-[#E4DDD0] py-8 sm:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#E4DDD0]">
          
          {/* Benefit 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 sm:gap-5 px-0 md:px-6 lg:px-8 pb-6 md:pb-0"
          >
            <div className="text-[#171715] shrink-0">
              {/* Sneaker outline SVG */}
              <svg
                className="w-8 h-8 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 15.5l3-4 5 1.5 4-5 6.5 2.5v5H2.5z" />
                <path d="M2.5 18h18.5" />
                <path d="M10.5 13l2.5 2.5" />
                <path d="M7 11.5l1.5 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#171715]">
                THOUGHTFUL SELECTION
              </h3>
              <p className="text-xs text-[#706B60] mt-1 leading-snug">
                A curated range of footwear for different styles and needs.
              </p>
            </div>
          </motion.div>

          {/* Benefit 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 sm:gap-5 px-0 md:px-6 lg:px-8 py-6 md:py-0"
          >
            <div className="text-[#171715] shrink-0">
              {/* T-Shirt / Apparel outline SVG */}
              <svg
                className="w-8 h-8 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3l3.5 2h5L18 3l3.5 4-2.5 2V21H5V9L2.5 7 6 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#171715]">
                EASY EVERYDAY STYLE
              </h3>
              <p className="text-xs text-[#706B60] mt-1 leading-snug">
                From work to weekend, find pairs that fit your life.
              </p>
            </div>
          </motion.div>

          {/* Benefit 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 sm:gap-5 px-0 md:px-6 lg:px-8 pt-6 md:pt-0"
          >
            <div className="text-[#171715] shrink-0">
              <ShoppingCart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#171715]">
                A SIMPLER WAY TO SHOP
              </h3>
              <p className="text-xs text-[#706B60] mt-1 leading-snug">
                A clean, straightforward shopping experience.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
