import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewsletterSectionProps {
  onSuccessToast: (msg: string) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onSuccessToast }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }
    setIsSubscribed(true);
    onSuccessToast(`Thanks for subscribing! Check ${email} for 10% off your first order.`);
    setEmail('');
  };

  return (
    <section className="bg-[#F5F1E8] border-t border-[#E4DDD0] py-14 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.5rem] tracking-tight uppercase leading-[0.92] text-[#171715]">
              GOOD THINGS,<br />
              IN YOUR INBOX.
            </h2>
          </motion.div>

          {/* Center: Description & Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <p className="text-xs sm:text-sm text-[#5E5A50] mb-3">
              Get new-arrival updates, collection highlights, and more.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="bg-transparent border border-[#BFB7A8] focus:border-[#171715] text-[#171715] placeholder-[#948F82] text-xs sm:text-sm rounded-lg px-4 py-2.5 flex-grow focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  className="bg-[#DCE96A] hover:bg-[#CAD858] text-[#171715] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shrink-0 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SUBSCRIBED</span>
                    </>
                  ) : (
                    <span>SIGN ME UP</span>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#8C8679] leading-normal pt-1">
                This is a frontend demonstration. No emails will be sent unless integrated with a mailing service.
              </p>
            </form>
          </motion.div>

          {/* Right: Brush illustration + Handwritten "Less Noise Better Steps" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center relative select-none"
          >
            {/* Subtle stylized brush stroke / sneaker tread art */}
            <div className="relative w-48 sm:w-56 h-28 flex items-center justify-center">
              {/* Organic brush tread SVG */}
              <svg
                viewBox="0 0 200 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full opacity-35 text-[#8A8474]"
              >
                <path
                  d="M10 45 C40 20, 80 15, 120 25 C150 32, 175 22, 190 35 C175 48, 150 42, 120 48 C85 55, 50 65, 15 52 Z"
                  fill="currentColor"
                />
                <path
                  d="M30 55 C65 60, 110 50, 140 60 C165 68, 180 58, 185 65 C160 75, 120 70, 75 75 C45 78, 25 72, 30 55 Z"
                  fill="currentColor"
                  opacity="0.6"
                />
                <circle cx="50" cy="38" r="4" fill="currentColor" opacity="0.4" />
                <circle cx="85" cy="42" r="5" fill="currentColor" opacity="0.4" />
                <circle cx="120" cy="35" r="4" fill="currentColor" opacity="0.4" />
              </svg>

              {/* Handwritten annotation overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-6">
                <span className="font-handwriting text-3xl sm:text-4xl text-[#3A3831] font-bold tracking-wide">
                  Less Noise
                </span>
                <span className="font-handwriting text-2xl sm:text-3xl text-[#3A3831] font-bold tracking-wide -mt-2 ml-4">
                  Better Steps
                </span>
                
                {/* Curved arrow pointing down-left */}
                <svg
                  className="w-7 h-7 text-[#504C42] mt-0.5 ml-6 rotate-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 4c0 6-6 10-10 12" />
                  <path d="M4 11l-1 5 5 1" />
                </svg>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
