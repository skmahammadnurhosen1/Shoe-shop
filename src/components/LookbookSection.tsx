import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LOOKBOOK_CARDS } from '../data/shoes';
import { LookbookCardItem } from '../types';

interface LookbookSectionProps {
  onExploreLookbook: () => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({ onExploreLookbook }) => {
  const [cards, setCards] = useState<
    Array<{
      id: string;
      tag: string;
      headline: string;
      image: string;
    }>
  >(LOOKBOOK_CARDS);

  useEffect(() => {
    const fetchDynamicLookbook = async () => {
      try {
        const res = await fetch('/api/homepage');
        const data = await res.json();
        if (
          data.success &&
          data.lookbookCards &&
          Array.isArray(data.lookbookCards) &&
          data.lookbookCards.length > 0
        ) {
          const mapped = data.lookbookCards.map((c: LookbookCardItem) => ({
            id: c.id,
            tag: c.tag,
            headline: c.headline,
            image: c.imageUrl,
          }));
          setCards(mapped);
        }
      } catch {
        // Fall back to LOOKBOOK_CARDS
      }
    };
    fetchDynamicLookbook();
  }, []);

  return (
    <section className="bg-[#F5F1E8] py-10 sm:py-14 overflow-hidden">
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
              YOUR DAILY ROTATION.
            </h2>
            <span className="text-xs sm:text-sm text-[#7D786C] font-normal">
              Different paths. Same attitude.
            </span>
          </div>

          <button
            onClick={onExploreLookbook}
            className="text-xs font-bold uppercase tracking-wider text-[#171715] hover:text-[#626849] inline-flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>EXPLORE THE LOOKBOOK</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>

        {/* 3 photographic cards with staggered scroll entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: idx * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={onExploreLookbook}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-[#E3DDCF] shadow-xs border border-[#E0D9CB] cursor-pointer"
            >
              <img
                src={card.image}
                alt={`${card.tag} - ${card.headline}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
              />

              {/* Dark subtle bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Text content at bottom left */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="font-display font-bold text-sm tracking-widest uppercase block mb-1 drop-shadow-sm text-[#F5F1E8]">
                  {card.tag}
                </span>
                <p className="text-xs text-[#E5E1D8] font-normal drop-shadow-sm">
                  {card.headline}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

