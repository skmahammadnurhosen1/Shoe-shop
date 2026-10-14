import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface EditorialBannerProps {
  onExploreCollection: () => void;
}

export const EditorialBanner: React.FC<EditorialBannerProps> = ({ onExploreCollection }) => {
  return (
    <section className="relative w-full bg-[#3F442C] overflow-hidden my-4 sm:my-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] sm:min-h-[420px] lg:min-h-[440px]">
        
        {/* Left / Background Photographic Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 relative min-h-[260px] sm:min-h-[320px] lg:min-h-full overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1400&q=85"
            alt="Person wearing olive trousers and cream-and-olive sneakers walking down natural stone steps"
            className="w-full h-full object-cover object-[center_35%] transition-transform duration-1000 ease-out hover:scale-103"
          />
          {/* Subtle vignette/feathering into the right olive side on desktop */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#3F442C]/20 to-[#3F442C] lg:to-[#3F442C]" />
        </motion.div>

        {/* Right Dark Olive Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 bg-[#3F442C] p-8 sm:p-12 lg:p-14 flex flex-col justify-center text-white relative z-10"
        >
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#DCE96A] mb-2 block">
            EVERYDAY MOVEMENT
          </span>

          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.5rem] uppercase leading-[0.94] tracking-tight text-white">
            BUILT FOR<br />
            THE EVERYDAY.
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-[#E2DFD2] font-normal leading-relaxed max-w-sm">
            Versatile footwear for real days, real places, and your unique style.
          </p>

          <div className="mt-6 sm:mt-7">
            <button
              onClick={onExploreCollection}
              className="bg-[#DCE96A] hover:bg-[#CAD858] text-[#171715] font-bold text-xs uppercase tracking-wider px-6 sm:px-7 py-3 sm:py-3.5 rounded-full inline-flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span>EXPLORE THE COLLECTION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
