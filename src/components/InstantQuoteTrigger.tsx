'use client';
import { useState, useEffect } from 'react';
import InstantQuote from '@/components/InstantQuote';

const STEPS = ['Property', 'Project', 'Materials', 'Add-ons', 'Estimate'];

export default function InstantQuoteTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className='bg-[#1B3C6B] rounded-2xl p-8 md:p-12 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group'
      >
        <div className='flex items-start justify-between mb-8'>
          <div>
            <p className='text-white font-black text-2xl'>Instant Quote Calculator</p>
            <p className='text-white/60 text-sm mt-1.5'>Measured to your actual roof · Real price range · No obligation</p>
          </div>
          <span className='bg-[#38BDF8] text-white text-sm font-black px-3 py-1.5 rounded-md tracking-wide uppercase flex-shrink-0'>FREE</span>
        </div>

        <div className='flex justify-between mb-8'>
          {STEPS.map((label, i) => (
            <div key={label} className='flex flex-col items-center gap-1.5'>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold border-2 ${i === 0 ? 'bg-[#38BDF8] text-white border-[#38BDF8]' : 'bg-white/10 text-white/40 border-white/20'}`}>{i + 1}</div>
              <span className={`text-xs font-medium ${i === 0 ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white/40 text-sm text-left'>123 Main St, Hartford, CT</div>
          <button className='bg-[#38BDF8] text-white font-black px-10 py-4 rounded-xl text-base uppercase tracking-wide group-hover:bg-[#0EA5E9] transition-colors whitespace-nowrap'>Get My Estimate →</button>
        </div>
      </div>

      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className='w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative'>
            <button
              onClick={() => setOpen(false)}
              className='absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold transition-colors'
              aria-label='Close'
            >✕</button>
            <InstantQuote />
          </div>
        </div>
      )}
    </>
  );
}
