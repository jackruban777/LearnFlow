import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, GraduationCap } from '@phosphor-icons/react';
import { CertificateBody } from './CertificateBody';

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

              {/* Certificate paper — wrapped for print targeting */}
              <div id="certificate-print-area" ref={certRef}>
                <CertificateBody
                  recipientName={recipientName}
                  skillName={skillName}
                  skillCategory={skillCategory}
                  completionDate={completionDate}
                  masteryScore={masteryScore}
                  enrollmentId={enrollmentId}
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
