import { Star } from '@phosphor-icons/react';

interface CertificateBodyProps {
  recipientName: string;
  skillName: string;
  skillCategory: string;
  completionDate: string;
  masteryScore: number;
  enrollmentId: string;
}

/** Pure visual certificate body — no interactivity, no print logic.
 *  Used by both the modal (Certificate.tsx) and the inline preview. */
export function CertificateBody({
  recipientName,
  skillName,
  skillCategory,
  completionDate,
  masteryScore,
  enrollmentId,
}: CertificateBodyProps) {
  const certId = `LF-${enrollmentId.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '11 / 8.5',
        background: 'white',
        color: '#1e1b4b',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '4px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Outer decorative border */}
      <div style={{ position: 'absolute', inset: '12px', border: '2px solid #4f46e5', borderRadius: '2px', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', inset: '18px', border: '0.5px solid #c4b5fd', borderRadius: '1px', pointerEvents: 'none', zIndex: 10 }} />

      {/* Corner ornaments */}
      {([{ top: 8, left: 8 }, { top: 8, right: 8 }, { bottom: 8, left: 8 }, { bottom: 8, right: 8 }] as React.CSSProperties[]).map((pos, i) => (
        <div key={i} style={{ position: 'absolute', width: '40px', height: '40px', ...pos, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #4f46e5', transform: 'rotate(45deg)' }} />
        </div>
      ))}

      {/* Background gradient pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          radial-gradient(circle at 15% 50%, rgba(99,102,241,0.05) 0%, transparent 50%),
          radial-gradient(circle at 85% 50%, rgba(139,92,246,0.05) 0%, transparent 50%),
          radial-gradient(circle at 50% 15%, rgba(79,70,229,0.03) 0%, transparent 40%),
          radial-gradient(circle at 50% 85%, rgba(79,70,229,0.03) 0%, transparent 40%)
        `,
      }} />

      {/* Top + bottom accent bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #6d28d9, #4f46e5)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #6d28d9, #4f46e5)' }} />

      {/* Main content */}
      <div style={{
        position: 'absolute', inset: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0, padding: '8px 40px',
      }}>

        {/* Logo + Org Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
          </div>
          <span style={{ fontFamily: '"Inter","Segoe UI",sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', color: '#1e1b4b' }}>LearnFlow</span>
        </div>

        {/* Stars divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, #4f46e5)' }} />
          <Star size={10} weight="fill" color="#4f46e5" />
          <Star size={14} weight="fill" color="#7c3aed" />
          <Star size={10} weight="fill" color="#4f46e5" />
          <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, #4f46e5, transparent)' }} />
        </div>

        <div style={{ fontFamily: '"Georgia","Times New Roman",serif', fontSize: '11px', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase', color: '#6d28d9', marginBottom: '6px' }}>
          Certificate of Completion
        </div>
        <div style={{ fontFamily: '"Georgia",serif', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontStyle: 'italic' }}>
          This is to certify that
        </div>
        <div style={{ fontFamily: '"Georgia","Times New Roman",serif', fontSize: '36px', fontWeight: 700, color: '#1e1b4b', lineHeight: 1.1, marginBottom: '6px', letterSpacing: '-0.5px', textAlign: 'center' }}>
          {recipientName}
        </div>
        <div style={{ fontFamily: '"Georgia",serif', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontStyle: 'italic' }}>
          has successfully completed the
        </div>
        <div style={{ fontFamily: '"Inter","Segoe UI",sans-serif', fontSize: '20px', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.3px', textAlign: 'center', marginBottom: '2px' }}>
          {skillName}
        </div>

        {/* Category badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 14px', borderRadius: '100px', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', fontSize: '10px', fontWeight: 700, color: '#4f46e5', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          {skillCategory} · AI-Powered Learning Path
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '12px', padding: '10px 32px', background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.12)', borderRadius: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#4f46e5', fontFamily: '"Inter",sans-serif' }}>{masteryScore}%</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Mastery Score</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(79,70,229,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontFamily: '"Inter",sans-serif' }}>PASSED</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Status</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(79,70,229,0.15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', fontFamily: '"Inter",sans-serif', paddingTop: '4px' }}>{formattedDate}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Issue Date</div>
          </div>
        </div>

        {/* Signatures + Seal */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontFamily: '"Georgia",serif', fontSize: '18px', color: '#1e1b4b', fontStyle: 'italic', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '4px' }}>LearnFlow AI</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Platform Director</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
            </div>
            <div style={{ fontSize: '8px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, fontFamily: '"Inter",sans-serif' }}>
              Verified · {certId}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontFamily: '"Georgia",serif', fontSize: '18px', color: '#1e1b4b', fontStyle: 'italic', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '4px' }}>AI Assessment</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Curriculum Board</div>
          </div>
        </div>

      </div>
    </div>
  );
}
