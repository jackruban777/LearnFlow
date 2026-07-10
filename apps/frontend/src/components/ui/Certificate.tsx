import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, GraduationCap, Star } from '@phosphor-icons/react';

interface CertificateProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  skillName: string;
  skillCategory: string;
  completionDate: string;
  masteryScore: number;
  enrollmentId: string;
}

export function Certificate({
  isOpen,
  onClose,
  recipientName,
  skillName,
  skillCategory,
  completionDate,
  masteryScore,
  enrollmentId,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const certId = `LF-${enrollmentId.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Print styles injected globally */}
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #certificate-print-area,
              #certificate-print-area * { visibility: visible !important; }
              #certificate-print-area {
                position: fixed !important;
                inset: 0 !important;
                width: 11in !important;
                height: 8.5in !important;
                margin: 0 !important;
                padding: 0 !important;
                z-index: 99999 !important;
                background: white !important;
              }
              @page {
                size: 11in 8.5in landscape;
                margin: 0;
              }
            }
          `}</style>

          {/* Modal Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl flex flex-col gap-4"
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-violet to-accent-indigo flex items-center justify-center">
                    <GraduationCap size={16} weight="fill" className="text-white" />
                  </div>
                  <span className="font-display font-bold text-white text-lg">Completion Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-violet/20 border border-accent-violet/30 text-accent-violet hover:bg-accent-violet/30 transition-all text-sm font-medium"
                  >
                    <Printer size={16} />
                    Print / Save PDF
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Certificate Paper — 11×8.5 landscape ratio */}
              <div
                id="certificate-print-area"
                ref={certRef}
                className="w-full bg-white text-gray-900 shadow-2xl"
                style={{
                  aspectRatio: '11 / 8.5',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '4px',
                }}
              >
                {/* Outer decorative border */}
                <div style={{
                  position: 'absolute',
                  inset: '12px',
                  border: '2px solid #4f46e5',
                  borderRadius: '2px',
                  pointerEvents: 'none',
                  zIndex: 10,
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '18px',
                  border: '0.5px solid #c4b5fd',
                  borderRadius: '1px',
                  pointerEvents: 'none',
                  zIndex: 10,
                }} />

                {/* Corner ornaments */}
                {[
                  { top: 8, left: 8 },
                  { top: 8, right: 8 },
                  { bottom: 8, left: 8 },
                  { bottom: 8, right: 8 },
                ].map((pos, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: '40px',
                      height: '40px',
                      ...pos,
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid #4f46e5',
                      transform: 'rotate(45deg)',
                    }} />
                  </div>
                ))}

                {/* Background pattern - subtle geometric */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    radial-gradient(circle at 15% 50%, rgba(99,102,241,0.05) 0%, transparent 50%),
                    radial-gradient(circle at 85% 50%, rgba(139,92,246,0.05) 0%, transparent 50%),
                    radial-gradient(circle at 50% 15%, rgba(79,70,229,0.03) 0%, transparent 40%),
                    radial-gradient(circle at 50% 85%, rgba(79,70,229,0.03) 0%, transparent 40%)
                  `,
                }} />

                {/* Top accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #6d28d9, #4f46e5)',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #6d28d9, #4f46e5)',
                }} />

                {/* Main content layout */}
                <div style={{
                  position: 'absolute',
                  inset: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0',
                  padding: '8px 40px',
                }}>

                  {/* Logo + Org Name */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                    }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                      </svg>
                    </div>
                    <span style={{
                      fontFamily: '"Inter", "Segoe UI", sans-serif',
                      fontWeight: 800,
                      fontSize: '20px',
                      letterSpacing: '-0.5px',
                      color: '#1e1b4b',
                    }}>LearnFlow</span>
                  </div>

                  {/* Decorative divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, #4f46e5)' }} />
                    <Star size={10} weight="fill" color="#4f46e5" />
                    <Star size={14} weight="fill" color="#7c3aed" />
                    <Star size={10} weight="fill" color="#4f46e5" />
                    <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, #4f46e5, transparent)' }} />
                  </div>

                  {/* Certificate of Completion heading */}
                  <div style={{
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontSize: '11px',
                    fontWeight: 400,
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color: '#6d28d9',
                    marginBottom: '6px',
                  }}>
                    Certificate of Completion
                  </div>

                  {/* "This is to certify that" */}
                  <div style={{
                    fontFamily: '"Georgia", serif',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                    fontStyle: 'italic',
                  }}>
                    This is to certify that
                  </div>

                  {/* Recipient Name */}
                  <div style={{
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#1e1b4b',
                    lineHeight: 1.1,
                    marginBottom: '6px',
                    letterSpacing: '-0.5px',
                    textAlign: 'center',
                  }}>
                    {recipientName}
                  </div>

                  {/* "has successfully completed" */}
                  <div style={{
                    fontFamily: '"Georgia", serif',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px',
                    fontStyle: 'italic',
                  }}>
                    has successfully completed the
                  </div>

                  {/* Skill Name */}
                  <div style={{
                    fontFamily: '"Inter", "Segoe UI", sans-serif',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#4f46e5',
                    letterSpacing: '-0.3px',
                    textAlign: 'center',
                    marginBottom: '2px',
                  }}>
                    {skillName}
                  </div>

                  {/* Category badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 14px',
                    borderRadius: '100px',
                    background: 'rgba(79,70,229,0.08)',
                    border: '1px solid rgba(79,70,229,0.2)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4f46e5',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}>
                    {skillCategory} · AI-Powered Learning Path
                  </div>

                  {/* Stats row */}
                  <div style={{
                    display: 'flex',
                    gap: '40px',
                    marginBottom: '12px',
                    padding: '10px 32px',
                    background: 'rgba(79,70,229,0.04)',
                    border: '1px solid rgba(79,70,229,0.12)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5', fontFamily: '"Inter", sans-serif' }}>
                        {masteryScore}%
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Mastery Score
                      </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(79,70,229,0.15)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontFamily: '"Inter", sans-serif' }}>
                        PASSED
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Status
                      </div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(79,70,229,0.15)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', fontFamily: '"Inter", sans-serif', paddingTop: '4px' }}>
                        {formattedDate}
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Issue Date
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: signatures + seal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                  }}>
                    {/* Signature 1 */}
                    <div style={{ textAlign: 'center', minWidth: '140px' }}>
                      <div style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '18px',
                        color: '#1e1b4b',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #d1d5db',
                        paddingBottom: '4px',
                        marginBottom: '4px',
                      }}>
                        LearnFlow AI
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Platform Director
                      </div>
                    </div>

                    {/* Center Seal */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                      }}>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                      </div>
                      <div style={{
                        fontSize: '8px',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        fontWeight: 700,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Verified · {certId}
                      </div>
                    </div>

                    {/* Signature 2 */}
                    <div style={{ textAlign: 'center', minWidth: '140px' }}>
                      <div style={{
                        fontFamily: '"Georgia", serif',
                        fontSize: '18px',
                        color: '#1e1b4b',
                        fontStyle: 'italic',
                        borderBottom: '1px solid #d1d5db',
                        paddingBottom: '4px',
                        marginBottom: '4px',
                      }}>
                        AI Assessment
                      </div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                        Curriculum Board
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
