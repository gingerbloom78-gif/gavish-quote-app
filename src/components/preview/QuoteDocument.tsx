import type { Quote } from '../../types'
import { companySettings } from '../../data/companyInfo'
import { formatCurrency } from '../../utils/formatters'

interface QuoteDocumentProps {
  quote: Quote
}

export default function QuoteDocument({ quote }: QuoteDocumentProps) {
  const vatPercent = Math.round(companySettings.vatRate * 100)
  const totalPages = companySettings.certificates.length > 0 ? 2 : 1

  return (
    <div id="quote-document" className="space-y-0" style={{ width: '794px' }}>
      {/* ===== PAGE 1: Quote ===== */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden text-sm">

        {/* ── Header with wave background ── */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#EAF4FA', minHeight: '110px' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L800,0 L800,120 Q650,180 400,140 Q150,100 0,160 Z"
              fill="#B8DFF0"
            />
            <path
              d="M0,0 L800,0 L800,80 Q600,150 350,110 Q100,70 0,130 Z"
              fill="#7BC4E0"
              opacity="0.6"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-10">
            {/* In RTL: first child renders RIGHT, second child renders LEFT */}

            {/* Logo (renders on the RIGHT in RTL) */}
            {companySettings.logoUrl && (
              <img
                src={companySettings.logoUrl}
                alt={companySettings.name}
                className="h-28 w-auto object-contain"
                crossOrigin="anonymous"
              />
            )}

            {/* Contact info (renders on the LEFT in RTL) */}
            <div className="flex flex-col gap-0.5 text-sm font-bold pt-1" style={{ color: '#1e3a5f' }} dir="ltr">
              <span>{companySettings.website}</span>
              <span>{companySettings.email}</span>
              <span>{companySettings.phone}</span>
            </div>
          </div>
        </div>

        {/* ── Subject (הנדון) Block ── */}
        <div className="text-center py-3 border-b" style={{ borderColor: '#D4EBF5' }}>
          <span className="text-base font-black" style={{ color: '#2B7BAF' }}>
            הנדון:
          </span>
          {' '}
          <span className="text-base font-bold text-gray-800">
            {quote.subject}
          </span>
        </div>

        {/* ── Client Details ── */}
        <div className="px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="font-bold min-w-[55px]" style={{ color: '#2B7BAF' }}>לכבוד:</span>
              <span className="text-gray-800">{quote.clientName}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold min-w-[55px]" style={{ color: '#2B7BAF' }}>כתובת:</span>
              <span className="text-gray-800">{quote.clientAddress}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-700">
            שלום רב, להלן התהליך לביצוע
          </p>
        </div>

        {/* ── Work Items Table ── */}
        <div className="px-5 pb-3">
          <table className="w-full border-collapse text-sm" style={{ borderColor: '#7BC4E0', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#D4EBF5' }}>
                <th
                  className="px-3 py-2 text-right font-bold w-[75%]"
                  style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}
                >
                  האיזורים לטיפול:
                </th>
                <th
                  className="px-3 py-2 text-center font-bold"
                  style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}
                >
                  מחיר
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id} className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td
                    className="px-3 py-3 align-top"
                    style={{ border: '1px solid #7BC4E0', overflowWrap: 'break-word', wordBreak: 'break-word' }}
                  >
                    <p className="font-bold mb-2" style={{ color: '#1e3a5f' }}>
                      {item.title}
                    </p>
                    {item.bullets.length > 0 && (
                      <ol className="space-y-1 pr-1">
                        {item.bullets.map((b, j) => (
                          <li key={j} className="text-xs text-gray-700 flex items-start gap-1.5">
                            <span className="font-medium text-gray-500 shrink-0 min-w-[16px]">
                              .{j + 1}
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400 mt-2">
                        ({item.quantity} {item.unit} × {formatCurrency(item.unitPrice)})
                      </p>
                    )}
                  </td>
                  <td
                    className="px-3 py-3 text-center align-top font-bold whitespace-nowrap"
                    style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}
                  >
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {quote.introText && (
                <tr className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td
                    colSpan={2}
                    className="px-3 py-2 font-medium"
                    style={{ border: '1px solid #7BC4E0', backgroundColor: '#D4EBF5', color: '#1e3a5f' }}
                  >
                    {quote.introText}
                  </td>
                </tr>
              )}

            </tbody>
            <tbody className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <tr>
                <td
                  className="px-3 py-2 text-left font-medium"
                  style={{ border: '1px solid #7BC4E0' }}
                >
                  מחיר
                </td>
                <td
                  className="px-3 py-2 text-center font-medium"
                  style={{ border: '1px solid #7BC4E0' }}
                >
                  {formatCurrency(quote.subtotal)}
                </td>
              </tr>
              <tr>
                <td
                  className="px-3 py-2 text-left font-medium"
                  style={{ border: '1px solid #7BC4E0' }}
                >
                  מע"מ ({vatPercent}%)
                </td>
                <td
                  className="px-3 py-2 text-center font-medium"
                  style={{ border: '1px solid #7BC4E0' }}
                >
                  {formatCurrency(quote.vatAmount)}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#D4EBF5' }}>
                <td
                  className="px-3 py-2 text-left font-bold text-base"
                  style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}
                >
                  סה"כ לתשלום
                </td>
                <td
                  className="px-3 py-2 text-center font-black text-base"
                  style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}
                >
                  {formatCurrency(quote.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {quote.notes && (
          <div className="px-6 pb-2 text-sm text-gray-700">
            <span className="font-bold" style={{ color: '#2B7BAF' }}>הערה: </span>
            {quote.notes}
          </div>
        )}

        {/* ── Notes / Terms ── */}
        <div className="avoid-break px-6 py-3" style={{ borderTop: '1px solid #D4EBF5', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <p className="font-bold text-sm mb-2" style={{ color: '#2B7BAF' }}>הערות:</p>
          <ul className="space-y-1.5">
            {companySettings.defaultNotes.map((note, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Legal Line ── */}
        <div className="avoid-break px-6 pb-3" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <p
            className="text-xs font-bold text-center rounded px-3 py-2"
            style={{ color: '#1e3a5f', border: '1px solid #7BC4E0', backgroundColor: '#EAF4FA' }}
          >
            {companySettings.legalLine}
          </p>
        </div>

        {/* ── Signature + Footer Wave ── */}
        <div className="avoid-break relative overflow-hidden" style={{ minHeight: '160px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          {/* Footer wave background */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 Q200,20 400,50 Q600,80 800,30 L800,200 L0,200 Z"
              fill="#B8DFF0"
            />
            <path
              d="M0,90 Q250,50 500,80 Q700,110 800,70 L800,200 L0,200 Z"
              fill="#7BC4E0"
              opacity="0.5"
            />
          </svg>

          <div className="relative z-10 px-6 pt-3 pb-4">
            <div className="flex items-end justify-between">
              {/* In RTL: first child = RIGHT, second child = LEFT */}

              {/* Text section (RIGHT in RTL) */}
              <div>
                <p className="text-base" style={{ color: '#1e3a5f' }}>בכבוד,</p>
                <p className="font-black text-xl mt-1" style={{ color: '#1e3a5f' }}>
                  {companySettings.contactPerson}
                </p>
                <p className="font-bold text-base" style={{ color: '#1e3a5f' }}>
                  {companySettings.legalName}
                </p>
                <p className="text-sm font-bold mt-1" style={{ color: '#1e3a5f' }}>
                  {companySettings.credentials}
                </p>
              </div>

              {/* Signature image (LEFT in RTL) */}
              {companySettings.signatureUrl && (
                <img
                  src={companySettings.signatureUrl}
                  alt="חתימה וחותמת"
                  className="h-32 w-auto object-contain"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>

          {/* Page number */}
          <div className="relative z-10 px-5 pb-2">
            <span className="text-xs font-medium" style={{ color: '#1e3a5f' }} dir="ltr">
              1/{totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* ===== PAGE 2: All Certificates on One Page ===== */}
      {companySettings.certificates.length > 0 && (
        <div
          className="pdf-page-break bg-white rounded-lg shadow-lg overflow-hidden mt-5"
          style={{ pageBreakBefore: 'always', border: '1px solid #D4EBF5' }}
        >
          {/* Header with wave */}
          <div className="relative overflow-hidden" style={{ backgroundColor: '#EAF4FA' }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 80"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0,0 L800,0 L800,50 Q400,80 0,55 Z" fill="#7BC4E0" opacity="0.4" />
            </svg>
            <div className="relative z-10 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {companySettings.logoUrl && (
                  <img
                    src={companySettings.logoUrl}
                    alt=""
                    className="h-10 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                )}
                <h3 className="font-bold text-base" style={{ color: '#1e3a5f' }}>
                  {companySettings.name}
                </h3>
              </div>
              <span className="text-sm font-bold" style={{ color: '#2B7BAF' }}>נספחים מקצועיים</span>
            </div>
          </div>

          {/* All Certificates Grid */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-3">
              {companySettings.certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid #D4EBF5' }}
                >
                  {cert.imageUrl ? (
                    <img
                      src={cert.imageUrl}
                      alt={cert.title}
                      className="w-full h-auto"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="py-8 text-center" style={{ backgroundColor: '#EAF4FA' }}>
                      <h3 className="font-bold text-xs" style={{ color: '#1e3a5f' }}>
                        {cert.title}
                      </h3>
                    </div>
                  )}
                  <div className="px-2 py-1.5 text-center" style={{ backgroundColor: '#EAF4FA' }}>
                    <p className="text-xs font-bold" style={{ color: '#1e3a5f' }}>
                      {cert.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page Number */}
          <div className="px-5 py-2 text-center" style={{ borderTop: '1px solid #D4EBF5' }}>
            <span className="text-xs text-gray-400" dir="ltr">
              2/{totalPages}
            </span>
          </div>
        </div>
      )}

      {/* ===== Hidden stamps for PDF page header/footer branding ===== */}
      <div id="pdf-header-stamp" style={{ position: 'absolute', left: '-9999px', width: '794px' }}>
        <div className="relative overflow-hidden bg-white" style={{ backgroundColor: '#EAF4FA', minHeight: '110px' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L800,0 L800,120 Q650,180 400,140 Q150,100 0,160 Z"
              fill="#B8DFF0"
            />
            <path
              d="M0,0 L800,0 L800,80 Q600,150 350,110 Q100,70 0,130 Z"
              fill="#7BC4E0"
              opacity="0.6"
            />
          </svg>
          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-10">
            {companySettings.logoUrl && (
              <img
                src={companySettings.logoUrl}
                alt={companySettings.name}
                className="h-28 w-auto object-contain"
                crossOrigin="anonymous"
              />
            )}
            {/* Logo only — no contact text on page 2+ headers */}
            <div />
          </div>
        </div>
      </div>

      <div id="pdf-footer-stamp" style={{ position: 'absolute', left: '-9999px', width: '794px' }}>
        <div className="relative overflow-hidden" style={{ minHeight: '70px' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 Q200,20 400,50 Q600,80 800,30 L800,200 L0,200 Z"
              fill="#B8DFF0"
            />
            <path
              d="M0,90 Q250,50 500,80 Q700,110 800,70 L800,200 L0,200 Z"
              fill="#7BC4E0"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
