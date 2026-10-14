import React, { useState, useEffect } from 'react';
import {
  Layout,
  Megaphone,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { StoredHomepageContent, HeroSlide, LookbookCardItem } from '../../types';

export const HomepageManagementView: React.FC = () => {
  const { adminToken } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'announcement' | 'hero' | 'lookbook'>('hero');
  const [content, setContent] = useState<StoredHomepageContent>({
    announcementBar: {
      enabled: true,
      text: 'COMPLIMENTARY PRIORITY EXPRESS AIR SHIPPING ON ORDERS OVER ₹1,999 · FREE RETURNS & SIZE EXCHANGES',
      link: 'all',
    },
    heroSlides: [],
    lookbookCards: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lightbox Image Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchHomepageConfig = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/homepage', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      } else {
        setErrorMessage(data.error || 'Failed to retrieve homepage configuration.');
      }
    } catch {
      setErrorMessage('Network error while connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchHomepageConfig();
    }
  }, [adminToken]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Homepage configuration updated successfully!');
        if (data.content) {
          setContent(data.content);
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save homepage settings.');
      }
    } catch {
      setErrorMessage('Network error while saving configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // Hero slide actions
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      badge: 'NEW SEASON 2026',
      headline: 'EVERYDAY MOVEMENT REDEFINED',
      subtitle: 'Premium footwear engineered for modern city life.',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1600',
      ctaText: 'SHOP COLLECTION',
      ctaLink: 'all',
      status: 'active',
      displayOrder: content.heroSlides.length + 1,
    };

    setContent({
      ...content,
      heroSlides: [...content.heroSlides, newSlide],
    });
  };

  const handleUpdateHeroSlide = (id: string, updates: Partial<HeroSlide>) => {
    setContent({
      ...content,
      heroSlides: content.heroSlides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const handleDeleteHeroSlide = (id: string) => {
    setContent({
      ...content,
      heroSlides: content.heroSlides.filter((s) => s.id !== id),
    });
  };

  const handleMoveSlideOrder = (index: number, direction: 'up' | 'down') => {
    const slides = [...content.heroSlides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    // Recalculate displayOrder
    const reordered = slides.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setContent({ ...content, heroSlides: reordered });
  };

  // Lookbook actions
  const handleAddLookbookCard = () => {
    const newCard: LookbookCardItem = {
      id: `lookbook-${Date.now()}`,
      tag: `CHAPTER 0${content.lookbookCards.length + 1}`,
      headline: 'New Seasonal Silhouette Study',
      description: 'Explorations into materials, textures, and ergonomic footbed contours.',
      imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=1000',
      displayOrder: content.lookbookCards.length + 1,
    };

    setContent({
      ...content,
      lookbookCards: [...content.lookbookCards, newCard],
    });
  };

  const handleUpdateLookbookCard = (id: string, updates: Partial<LookbookCardItem>) => {
    setContent({
      ...content,
      lookbookCards: content.lookbookCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const handleDeleteLookbookCard = (id: string) => {
    setContent({
      ...content,
      lookbookCards: content.lookbookCards.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-8 select-none sm:select-auto font-sans antialiased text-[#171715]">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#7A776D] block">
            STOREFRONT EDITORIAL & CONTENT
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#171715]">
            Homepage Content & Banner Manager
          </h2>
          <p className="text-xs text-[#5A584E] mt-1 max-w-xl">
            Control the top announcement bar ticker, hero carousel slides, and Lookbook stories in real time.
          </p>
        </div>

        <div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase rounded-xl transition duration-150 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#DCE96A]" />
                <span>SAVE CONFIGURATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-[#DCE96A]/20 border border-[#8C9B32] rounded-2xl flex items-center gap-2.5 text-xs text-[#3A5328] font-medium">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-[#FDF2F2] border border-[#FCA5A5] rounded-2xl flex items-center gap-2.5 text-xs text-[#991B1B]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-2 shadow-xs flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
              : 'text-[#5A584E] hover:text-[#171715]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slides Carousel ({content.heroSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
            activeTab === 'announcement'
              ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
              : 'text-[#5A584E] hover:text-[#171715]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcement Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('lookbook')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer ${
            activeTab === 'lookbook'
              ? 'bg-[#171715] text-[#FAF8F5] shadow-xs'
              : 'text-[#5A584E] hover:text-[#171715]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lookbook Series Cards ({content.lookbookCards.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl py-20 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#171715] mx-auto" />
          <p className="text-xs text-[#7A776D] font-mono">Loading homepage configuration...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Announcement Bar Editor */}
          {activeTab === 'announcement' && (
            <div className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#DFD8CC] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#171715]">
                    Top Announcement Ticker Bar
                  </h3>
                  <p className="text-xs text-[#5A584E] mt-0.5">
                    This bar appears at the very top of the storefront header on all pages.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      announcementBar: {
                        ...content.announcementBar,
                        enabled: !content.announcementBar.enabled,
                      },
                    })
                  }
                  className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  {content.announcementBar.enabled ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-[#52792B]" />
                      <span className="text-[#3D4336]">Enabled</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-[#9C988D]" />
                      <span className="text-[#7A776D]">Disabled</span>
                    </>
                  )}
                </button>
              </div>

              {/* Banner Text Input */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1.5">
                    Announcement Banner Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={content.announcementBar.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        announcementBar: {
                          ...content.announcementBar,
                          text: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. COMPLIMENTARY PRIORITY EXPRESS SHIPPING ON ORDERS OVER ₹1,999"
                    className="w-full px-4 py-3 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-semibold text-[#171715] focus:outline-none focus:border-[#171715]"
                  />
                </div>

                {/* Banner Live Preview */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A776D] block mb-2">
                    Live Storefront Ticker Preview
                  </span>
                  <div className="bg-[#171715] text-[#FAF8F5] py-2.5 px-4 rounded-xl text-[11px] font-mono font-medium tracking-wider uppercase text-center truncate shadow-sm">
                    {content.announcementBar.enabled
                      ? content.announcementBar.text || 'ANNOUNCEMENT BAR IS ENABLED'
                      : '[ Banner Hidden ]'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hero Carousel Slides Editor */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#171715]">
                    Hero Carousel Slides ({content.heroSlides.length})
                  </h3>
                  <p className="text-xs text-[#5A584E]">
                    Slides cycle automatically on the storefront homepage hero section.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddHeroSlide}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD HERO SLIDE</span>
                </button>
              </div>

              {/* Slides Cards List */}
              <div className="space-y-6">
                {content.heroSlides.map((slide, idx) => {
                  const isActive = slide.status === 'active';

                  return (
                    <div
                      key={slide.id}
                      className={`bg-[#FAF8F5] border rounded-2xl p-6 shadow-xs space-y-4 transition ${
                        isActive ? 'border-[#DFD8CC]' : 'border-[#E2DDD0] opacity-75'
                      }`}
                    >
                      {/* Top Action Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFD8CC] pb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#EAE5D9] text-[#171715] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-[#171715] block">
                              {slide.headline || 'Untitled Slide'}
                            </span>
                            <span className="text-[10px] font-mono text-[#7A776D]">
                              ID: {slide.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Order buttons */}
                          <button
                            type="button"
                            onClick={() => handleMoveSlideOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-[#5A584E] hover:text-[#171715] bg-[#F5F1E8] hover:bg-[#EAE5D9] rounded-lg border border-[#DFD8CC] transition disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSlideOrder(idx, 'down')}
                            disabled={idx === content.heroSlides.length - 1}
                            className="p-1.5 text-[#5A584E] hover:text-[#171715] bg-[#F5F1E8] hover:bg-[#EAE5D9] rounded-lg border border-[#DFD8CC] transition disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Active Toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateHeroSlide(slide.id, {
                                status: isActive ? 'inactive' : 'active',
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F1E8] rounded-xl border border-[#DFD8CC] text-xs font-semibold cursor-pointer"
                          >
                            {isActive ? (
                              <>
                                <ToggleRight className="w-5 h-5 text-[#52792B]" />
                                <span className="text-[#3D4336] text-[11px]">Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5 text-[#9C988D]" />
                                <span className="text-[#7A776D] text-[11px]">Hidden</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteHeroSlide(slide.id)}
                            className="p-1.5 text-[#7A776D] hover:text-[#C94A38] hover:bg-[#FDF2F2] rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                            Kicker Badge *
                          </label>
                          <input
                            type="text"
                            value={slide.badge}
                            onChange={(e) =>
                              handleUpdateHeroSlide(slide.id, { badge: e.target.value })
                            }
                            placeholder="e.g. 2026 EDITORIAL EDITION"
                            className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-bold text-[#171715] focus:outline-none focus:border-[#171715]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                            Main Headline *
                          </label>
                          <input
                            type="text"
                            value={slide.headline}
                            onChange={(e) =>
                              handleUpdateHeroSlide(slide.id, { headline: e.target.value })
                            }
                            placeholder="e.g. CONSIDERED EVERYDAY FOOTWEAR"
                            className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-serif text-sm font-semibold text-[#171715] focus:outline-none focus:border-[#171715]"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                            Subtitle Prose
                          </label>
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) =>
                              handleUpdateHeroSlide(slide.id, { subtitle: e.target.value })
                            }
                            placeholder="e.g. Architectural silhouettes crafted in full-grain calfskin..."
                            className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                            Hero Image Asset URL *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.imageUrl}
                              onChange={(e) =>
                                handleUpdateHeroSlide(slide.id, { imageUrl: e.target.value })
                              }
                              placeholder="https://..."
                              className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                            />
                            {slide.imageUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(slide.imageUrl)}
                                className="p-2 bg-[#EAE5D9] hover:bg-[#DFD8CC] text-[#171715] rounded-xl transition cursor-pointer shrink-0"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                              CTA Button Text
                            </label>
                            <input
                              type="text"
                              value={slide.ctaText}
                              onChange={(e) =>
                                handleUpdateHeroSlide(slide.id, { ctaText: e.target.value })
                              }
                              placeholder="e.g. EXPLORE COLLECTION"
                              className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-bold text-[#171715] focus:outline-none focus:border-[#171715]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                              Target Category Link
                            </label>
                            <select
                              value={slide.ctaLink}
                              onChange={(e) =>
                                handleUpdateHeroSlide(slide.id, { ctaLink: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                            >
                              <option value="all">All Shoes</option>
                              <option value="New Arrivals">New Arrivals</option>
                              <option value="Men's Sneakers">Men's Sneakers</option>
                              <option value="Men's Casual">Men's Casual</option>
                              <option value="Boots & High-Tops">Boots & High-Tops</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Lookbook Series Cards Manager */}
          {activeTab === 'lookbook' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#171715]">
                    Lookbook Series Cards ({content.lookbookCards.length})
                  </h3>
                  <p className="text-xs text-[#5A584E]">
                    Editorial stories showcased in the "Your Daily Rotation" Lookbook section.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddLookbookCard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#171715] hover:bg-[#2A2A26] text-[#FAF8F5] text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD LOOKBOOK CARD</span>
                </button>
              </div>

              {/* Lookbook Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.lookbookCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="bg-[#FAF8F5] border border-[#DFD8CC] rounded-2xl p-5 shadow-xs space-y-4 relative flex flex-col justify-between"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#DFD8CC] pb-3">
                      <span className="font-mono text-xs font-bold text-[#171715] bg-[#EAE5D9] px-2 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLookbookCard(card.id)}
                        className="p-1 text-[#7A776D] hover:text-[#C94A38] hover:bg-[#FDF2F2] rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="relative aspect-4/3 bg-[#EAE5D9] rounded-xl overflow-hidden border border-[#DFD8CC]">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.headline}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#7A776D]">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                          Chapter Tag *
                        </label>
                        <input
                          type="text"
                          value={card.tag}
                          onChange={(e) =>
                            handleUpdateLookbookCard(card.id, { tag: e.target.value })
                          }
                          placeholder="e.g. CHAPTER 01"
                          className="w-full px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-mono text-xs font-bold text-[#171715] focus:outline-none focus:border-[#171715]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                          Headline *
                        </label>
                        <input
                          type="text"
                          value={card.headline}
                          onChange={(e) =>
                            handleUpdateLookbookCard(card.id, { headline: e.target.value })
                          }
                          placeholder="e.g. Architectural Soles"
                          className="w-full px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl font-serif text-xs font-semibold text-[#171715] focus:outline-none focus:border-[#171715]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                          Story Description
                        </label>
                        <textarea
                          rows={3}
                          value={card.description}
                          onChange={(e) =>
                            handleUpdateLookbookCard(card.id, { description: e.target.value })
                          }
                          placeholder="Short story paragraph..."
                          className="w-full px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#171715] mb-1">
                          Image Asset URL *
                        </label>
                        <input
                          type="text"
                          value={card.imageUrl}
                          onChange={(e) =>
                            handleUpdateLookbookCard(card.id, { imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 bg-[#F5F1E8] border border-[#DFD8CC] rounded-xl text-xs text-[#171715] focus:outline-none focus:border-[#171715]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img
              src={previewImage}
              alt="Enlarged hero image"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
