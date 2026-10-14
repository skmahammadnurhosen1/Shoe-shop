import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/shoes';

interface CategorySectionProps {
  onSelectCategory: (category: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="bg-[#F5F1E8] py-8 sm:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6"
        >
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-tight text-[#171715]">
              FIND YOUR FIT.
            </h2>
            <span className="text-xs sm:text-sm text-[#7D786C] font-normal">
              Made for the way you move.
            </span>
          </div>

          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#626849] inline-flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>EXPLORE ALL CATEGORIES</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>

        {/* 4 Cards in one row with staggered scroll entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => onSelectCategory(cat.title)}
              className="group relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] bg-[#E5DECE] cursor-pointer shadow-xs border border-[#E0D9CB]"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
              />

              {/* Dark Gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

              {/* Title & Arrow */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="font-medium text-sm sm:text-[15px] tracking-wide drop-shadow-sm group-hover:underline underline-offset-4">
                  {cat.title}
                </span>
                <span className="text-sm font-semibold transition-transform group-hover:translate-x-1.5">
                  →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
