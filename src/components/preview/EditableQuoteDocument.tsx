import { useRef, useEffect, useState, createElement, Fragment } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { ArrowUp, ArrowDown, Pencil, Copy, Trash2, Plus, X, Image, Camera } from 'lucide-react'
import type { Quote, QuoteLineItem } from '../../types'
import { companySettings } from '../../data/companyInfo'
import { formatCurrency } from '../../utils/formatters'

interface EditableQuoteDocumentProps {
  quote: Quote
  onUpdateItem: (item: QuoteLineItem) => void
  onDeleteItem: (itemId: string) => void
  onDuplicateItem: (itemId: string) => void
  onReorderItem: (itemId: string, direction: 'up' | 'down') => void
  onInsertAfter: (afterIndex: number) => void
  onEditItem: (item: QuoteLineItem) => void
  onUpdateSubject: (text: string) => void
  onUpdateTableHeader: (text: string) => void
  onUpdateIntroText: (text: string) => void
  onUpdateNotes: (text: string) => void
  onUpdateCustomNotes: (notes: string[]) => void
  onAddPhoto: () => void
  onAddPhotoCamera: () => void
  onDeletePhoto: (photoId: string) => void
  onUpdatePhotoComment: (photoId: string, comment: string) => void
}

/* ── Inline contentEditable text ── */
function EditableText({
  tag = 'span',
  text,
  onSave,
  className = '',
  style,
  nodeRef,
}: {
  tag?: string
  text: string
  onSave: (v: string) => void
  className?: string
  style?: CSSProperties
  nodeRef?: RefObject<HTMLElement | null>
}) {
  const ownRef = useRef<HTMLElement>(null)
  const ref = nodeRef ?? ownRef

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = text
    }
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  return createElement(tag, {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    className: `outline-none cursor-text ${className}`,
    style,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const val = e.currentTarget.textContent || ''
      if (val !== text) onSave(val)
    },
  })
}

/* ── Single line-item row with inline editing ── */
function LineItemRow({
  item,
  index,
  total,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onReorderItem,
  onEditItem,
}: {
  item: QuoteLineItem
  index: number
  total: number
  onUpdateItem: (item: QuoteLineItem) => void
  onDeleteItem: (id: string) => void
  onDuplicateItem: (id: string) => void
  onReorderItem: (id: string, dir: 'up' | 'down') => void
  onEditItem: (item: QuoteLineItem) => void
}) {
  const [editingPrice, setEditingPrice] = useState(false)
  const prevBulletsLen = useRef(item.bullets.length)
  const lastBulletRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (item.bullets.length > prevBulletsLen.current && lastBulletRef.current) {
      lastBulletRef.current.focus()
    }
    prevBulletsLen.current = item.bullets.length
  }, [item.bullets.length])

  return (
    <tr className="avoid-break group/row" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <td
        className="px-3 py-3 align-top relative"
        style={{ border: '1px solid #7BC4E0', overflowWrap: 'break-word', wordBreak: 'break-word' }}
      >
        {/* Action bar — hover affordance */}
        <div
          data-edit-ui="true"
          className="absolute top-1.5 left-1.5 flex gap-0.5 opacity-0 group-hover/row:opacity-100
                     transition-opacity bg-white/95 rounded-lg shadow-md border border-gray-100 p-0.5 z-10"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onReorderItem(item.id, 'up') }}
            disabled={index === 0}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
            title="העלה"
          >
            <ArrowUp size={13} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReorderItem(item.id, 'down') }}
            disabled={index === total - 1}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
            title="הורד"
          >
            <ArrowDown size={13} className="text-gray-600" />
          </button>
          <div className="w-px bg-gray-200 my-0.5" />
          <button
            onClick={(e) => { e.stopPropagation(); onEditItem(item) }}
            className="p-1 hover:bg-blue-50 rounded"
            title="ערוך"
          >
            <Pencil size={13} className="text-blue-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicateItem(item.id) }}
            className="p-1 hover:bg-gray-100 rounded"
            title="שכפל"
          >
            <Copy size={13} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id) }}
            className="p-1 hover:bg-red-50 rounded"
            title="מחק"
          >
            <Trash2 size={13} className="text-red-500" />
          </button>
        </div>

        <EditableText
          tag="p"
          text={item.title}
          onSave={(v) => onUpdateItem({ ...item, title: v })}
          className="font-bold mb-2"
          style={{ color: '#1e3a5f' }}
        />

        {item.bullets.length > 0 && (
          <ol className="space-y-1 pr-1">
            {item.bullets.map((b, j) => {
              const isLast = j === item.bullets.length - 1
              return (
                <li key={j} className="text-xs text-gray-700 flex items-start gap-1.5 group/bullet">
                  <span className="font-medium text-gray-500 shrink-0 min-w-[16px]">.{j + 1}</span>
                  <EditableText
                    tag="span"
                    text={b}
                    onSave={(v) => {
                      const bullets = [...item.bullets]
                      bullets[j] = v
                      onUpdateItem({ ...item, bullets })
                    }}
                    className="flex-1"
                    nodeRef={isLast ? lastBulletRef : undefined}
                  />
                  <button
                    data-edit-ui="true"
                    onClick={() => onUpdateItem({ ...item, bullets: item.bullets.filter((_, i) => i !== j) })}
                    className="opacity-0 group-hover/bullet:opacity-100 transition-opacity text-gray-400 hover:text-red-500 shrink-0 mt-0.5"
                    title="מחק שלב"
                  >
                    <X size={11} />
                  </button>
                </li>
              )
            })}
          </ol>
        )}

        <button
          data-edit-ui="true"
          onClick={() => onUpdateItem({ ...item, bullets: [...item.bullets, ''] })}
          className="mt-1.5 text-xs text-accent/60 hover:text-accent transition-colors flex items-center gap-1"
        >
          <Plus size={11} />
          <span>+ הוסף שלב</span>
        </button>

        {item.quantity > 1 && (
          <p className="text-xs text-gray-400 mt-2">
            ({item.quantity} {item.unit} × {formatCurrency(item.unitPrice)})
          </p>
        )}
      </td>

      <td
        className="px-3 py-3 text-center align-top font-bold whitespace-nowrap"
        style={{ border: '1px solid #7BC4E0', color: '#1e3a5f', cursor: editingPrice ? 'default' : 'pointer' }}
        onClick={() => { if (!editingPrice) setEditingPrice(true) }}
      >
        {editingPrice ? (
          <div data-edit-ui="true">
            <input
              type="number"
              autoFocus
              defaultValue={item.unitPrice}
              className="w-full text-center font-bold outline-none border-b border-blue-400 bg-transparent"
              style={{ color: '#1e3a5f', fontSize: 'inherit' }}
              onBlur={(e) => {
                const parsed = parseFloat(e.target.value) || 0
                onUpdateItem({ ...item, unitPrice: parsed, lineTotal: parsed * item.quantity })
                setEditingPrice(false)
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            />
            {item.quantity > 1 && (
              <p className="text-xs text-gray-400 mt-1">×{item.quantity} יח'</p>
            )}
          </div>
        ) : (
          <span>{formatCurrency(item.lineTotal)}</span>
        )}
      </td>
    </tr>
  )
}

/* ── Controlled contentEditable ── */
function useEditableRef(value: string, onUpdate: (v: string) => void) {
  const ref = useRef<HTMLElement>(null)
  const isEditing = useRef(false)

  useEffect(() => {
    if (ref.current && !isEditing.current) {
      ref.current.textContent = value
    }
  }, [value])

  return {
    ref,
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    onFocus: () => { isEditing.current = true },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      isEditing.current = false
      onUpdate(e.currentTarget.textContent || '')
    },
  }
}

export default function EditableQuoteDocument({
  quote,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onReorderItem,
  onInsertAfter,
  onEditItem,
  onUpdateSubject,
  onUpdateTableHeader,
  onUpdateIntroText,
  onUpdateNotes,
  onUpdateCustomNotes,
  onAddPhoto,
  onAddPhotoCamera,
  onDeletePhoto,
  onUpdatePhotoComment,
}: EditableQuoteDocumentProps) {
  const vatPercent = Math.round(companySettings.vatRate * 100)
  const hasPhotos = (quote.photos?.length ?? 0) > 0
  const hasCerts = companySettings.certificates.length > 0
  const totalPages = 1 + (hasCerts ? 1 : 0) + (hasPhotos ? 1 : 0)

  const subjectProps = useEditableRef(quote.subject || '', onUpdateSubject)
  const tableHeaderProps = useEditableRef(quote.tableHeader ?? 'האיזורים לטיפול:', onUpdateTableHeader)
  const introProps = useEditableRef(quote.introText || '', onUpdateIntroText)
  const notesProps = useEditableRef(quote.notes || '', onUpdateNotes)

  const activeNotes = quote.customNotes ?? companySettings.defaultNotes

  const handleNoteChange = (i: number, val: string) => {
    const updated = [...activeNotes]
    updated[i] = val
    onUpdateCustomNotes(updated)
  }

  const handleDeleteNote = (i: number) => {
    onUpdateCustomNotes(activeNotes.filter((_, j) => j !== i))
  }

  const handleAddNote = () => {
    onUpdateCustomNotes([...activeNotes, ''])
  }

  return (
    <div id="quote-document" className="space-y-0" style={{ width: '794px' }}>
      {/* ===== PAGE 1: Quote ===== */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden text-sm">

        {/* ── Header with wave background ── */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#EAF4FA', minHeight: '110px' }}>
          {/* ── בס״ד ── */}
          <div className="absolute top-2 right-4 text-xs font-bold z-20" style={{ color: '#1e3a5f' }}>
            בס״ד
          </div>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,0 L800,0 L800,120 Q650,180 400,140 Q150,100 0,160 Z" fill="#B8DFF0" />
            <path d="M0,0 L800,0 L800,80 Q600,150 350,110 Q100,70 0,130 Z" fill="#7BC4E0" opacity="0.6" />
          </svg>

          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-10">
            {companySettings.logoUrl && (
              <img src={companySettings.logoUrl} alt={companySettings.name} className="h-28 w-auto object-contain" crossOrigin="anonymous" />
            )}
            <div className="flex flex-col gap-0.5 text-sm font-bold pt-1" style={{ color: '#1e3a5f' }} dir="ltr">
              <span>{companySettings.website}</span>
              <span>{companySettings.email}</span>
            </div>
          </div>
        </div>

        {/* ── Subject (editable) ── */}
        <div className="text-center py-3 border-b" style={{ borderColor: '#D4EBF5' }}>
          <span className="text-base font-black" style={{ color: '#2B7BAF' }}>הנדון:</span>
          {' '}
          <span
            className="text-base font-bold text-gray-800 outline-none border-b border-dashed border-transparent
                       hover:border-accent/40 focus:border-accent/60 cursor-text transition-colors"
            {...subjectProps}
            ref={subjectProps.ref as React.RefObject<HTMLSpanElement>}
          />
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
          <p className="mt-3 text-sm text-gray-700">שלום רב, להלן התהליך לביצוע</p>
        </div>

        {/* ── Work Items Table ── */}
        <div className="px-5 pb-3">
          <table className="w-full border-collapse text-sm" style={{ borderColor: '#7BC4E0', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#D4EBF5' }}>
                <th className="px-3 py-2 text-right font-bold w-[75%]" style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}>
                  <span
                    className="outline-none cursor-text border-b border-dashed border-transparent
                               hover:border-navy/30 focus:border-navy/60 transition-colors"
                    {...tableHeaderProps}
                    ref={tableHeaderProps.ref as React.RefObject<HTMLSpanElement>}
                  />
                </th>
                <th className="px-3 py-2 text-center font-bold" style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}>
                  מחיר
                </th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item, index) => (
                <Fragment key={item.id}>
                  <LineItemRow
                    item={item}
                    index={index}
                    total={quote.lineItems.length}
                    onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem}
                    onDuplicateItem={onDuplicateItem}
                    onReorderItem={onReorderItem}
                    onEditItem={onEditItem}
                  />

                  {/* ── Insert zone after each item ── */}
                  <tr
                    data-edit-ui="true"
                    className="cursor-pointer group/ins"
                    onClick={() => onInsertAfter(index)}
                  >
                    <td colSpan={2} style={{ padding: 0, border: 'none', height: '12px' }}>
                      <div className="w-full h-full relative flex items-center justify-center group-hover/ins:bg-accent/5 transition-colors">
                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-px bg-transparent group-hover/ins:bg-accent/40 transition-colors" />
                        <div className="w-5 h-5 rounded-full bg-accent/10 group-hover/ins:bg-accent text-accent group-hover/ins:text-white flex items-center justify-center text-xs font-bold transition-all z-10 leading-none shadow-sm opacity-0 group-hover/ins:opacity-100">
                          +
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}

              {/* ── Always-visible add row ── */}
              <tr
                data-edit-ui="true"
                className="cursor-pointer"
                onClick={() => onInsertAfter(-1)}
              >
                <td
                  colSpan={2}
                  className="px-3 py-2.5 text-center hover:bg-accent/5 transition-colors"
                  style={{ border: '1px dashed #7BC4E080' }}
                >
                  <div className="flex items-center justify-center gap-2 text-accent/50 hover:text-accent transition-colors">
                    <Plus size={15} />
                    <span className="text-xs font-semibold">הוסף פריט</span>
                  </div>
                </td>
              </tr>

              {/* ── Intro text row (always shown, editable) ── */}
              <tr className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <td
                  colSpan={2}
                  className="px-3 py-2 font-medium outline-none"
                  style={{ border: '1px solid #7BC4E0', backgroundColor: '#D4EBF5', color: '#1e3a5f', cursor: 'text' }}
                  {...introProps}
                  ref={introProps.ref as React.RefObject<HTMLTableCellElement>}
                />
              </tr>
            </tbody>

            {/* ── Totals ── */}
            <tbody className="avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <tr>
                <td className="px-3 py-2 text-left font-medium" style={{ border: '1px solid #7BC4E0' }}>מחיר</td>
                <td className="px-3 py-2 text-center font-medium" style={{ border: '1px solid #7BC4E0' }}>
                  {formatCurrency(quote.subtotal)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-left font-medium" style={{ border: '1px solid #7BC4E0' }}>
                  מע"מ <span dir="ltr">({vatPercent}%)</span>
                </td>
                <td className="px-3 py-2 text-center font-medium" style={{ border: '1px solid #7BC4E0' }}>
                  {formatCurrency(quote.vatAmount)}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#D4EBF5' }}>
                <td className="px-3 py-2 text-left font-bold text-base" style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}>
                  סה"כ לתשלום
                </td>
                <td className="px-3 py-2 text-center font-black text-base" style={{ border: '1px solid #7BC4E0', color: '#1e3a5f' }}>
                  {formatCurrency(quote.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Notes (always shown, editable) ── */}
        <div className="px-6 pb-2 text-sm text-gray-700">
          <span className="font-bold" style={{ color: '#2B7BAF' }}>הערה: </span>
          <span
            className="outline-none border-b border-dashed border-accent/0 hover:border-accent/40 focus:border-accent/60 transition-colors min-w-[60px] inline-block"
            style={{ cursor: 'text', color: '#374151' }}
            {...notesProps}
            ref={notesProps.ref as React.RefObject<HTMLSpanElement>}
            data-placeholder="הוסף הערה..."
          />
        </div>

        {/* ── Notes / Terms (inline editable) ── */}
        <div className="avoid-break px-6 py-3" style={{ borderTop: '1px solid #D4EBF5', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <p className="font-bold text-sm mb-2" style={{ color: '#2B7BAF' }}>הערות:</p>
          <ul className="space-y-1.5">
            {activeNotes.map((note, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5 group/note">
                <span className="shrink-0 mt-0.5">•</span>
                <EditableText
                  tag="span"
                  text={note}
                  onSave={(v) => handleNoteChange(i, v)}
                  className="flex-1 outline-none cursor-text border-b border-dashed border-transparent hover:border-accent/30 focus:border-accent/50 transition-colors"
                />
                <button
                  data-edit-ui="true"
                  onClick={() => handleDeleteNote(i)}
                  className="opacity-0 group-hover/note:opacity-100 transition-opacity text-gray-300
                             hover:text-red-400 shrink-0 mt-0.5"
                  title="מחק הערה"
                >
                  <X size={11} />
                </button>
              </li>
            ))}
          </ul>
          <button
            data-edit-ui="true"
            onClick={handleAddNote}
            className="mt-1.5 text-xs text-accent/50 hover:text-accent transition-colors flex items-center gap-1"
          >
            <Plus size={11} />
            <span>+ הוסף הערה</span>
          </button>
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
        <div
          data-pdf-signature="true"
          className="avoid-break relative overflow-hidden"
          style={{ minHeight: '160px', pageBreakInside: 'avoid', breakInside: 'avoid' }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 Q200,20 400,50 Q600,80 800,30 L800,200 L0,200 Z" fill="#B8DFF0" />
            <path d="M0,90 Q250,50 500,80 Q700,110 800,70 L800,200 L0,200 Z" fill="#7BC4E0" opacity="0.5" />
          </svg>
          <div className="relative z-10 px-6 pt-3 pb-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-base" style={{ color: '#1e3a5f' }}>בכבוד,</p>
                <p className="font-black text-xl mt-1" style={{ color: '#1e3a5f' }}>{companySettings.contactPerson}</p>
                <p className="font-bold text-base" style={{ color: '#1e3a5f' }}>{companySettings.legalName}</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#1e3a5f' }}>{companySettings.credentials}</p>
              </div>
              {companySettings.signatureUrl && (
                <img src={companySettings.signatureUrl} alt="חתימה וחותמת" className="h-32 w-auto object-contain" crossOrigin="anonymous" />
              )}
            </div>
          </div>
          <div className="relative z-10 px-5 pb-2">
            <span className="text-xs font-medium" style={{ color: '#1e3a5f' }} dir="ltr">1/{totalPages}</span>
          </div>
        </div>
      </div>

      {/* ===== PAGE 2: Certificates ===== */}
      {companySettings.certificates.length > 0 && (
        <div
          className="pdf-page-break bg-white rounded-lg shadow-lg overflow-hidden mt-5"
          style={{ pageBreakBefore: 'always', border: '1px solid #D4EBF5' }}
        >
          <div className="relative overflow-hidden" style={{ backgroundColor: '#EAF4FA' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 L800,0 L800,50 Q400,80 0,55 Z" fill="#7BC4E0" opacity="0.4" />
            </svg>
            <div className="relative z-10 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {companySettings.logoUrl && (
                  <img src={companySettings.logoUrl} alt="" className="h-10 w-auto object-contain" crossOrigin="anonymous" />
                )}
              </div>
              <span className="text-sm font-bold" style={{ color: '#2B7BAF' }}>נספחים מקצועיים</span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-3">
              {companySettings.certificates.map((cert) => (
                <div key={cert.id} className="rounded-lg overflow-hidden" style={{ border: '1px solid #D4EBF5' }}>
                  {cert.imageUrl ? (
                    <img src={cert.imageUrl} alt={cert.title} className="w-full h-auto" crossOrigin="anonymous" />
                  ) : (
                    <div className="py-8 text-center" style={{ backgroundColor: '#EAF4FA' }}>
                      <h3 className="font-bold text-xs" style={{ color: '#1e3a5f' }}>{cert.title}</h3>
                    </div>
                  )}
                  <div className="px-2 py-1.5 text-center" style={{ backgroundColor: '#EAF4FA' }}>
                    <p className="text-xs font-bold" style={{ color: '#1e3a5f' }}>{cert.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-2 text-center" style={{ borderTop: '1px solid #D4EBF5' }}>
            <span className="text-xs text-gray-400" dir="ltr">2/{totalPages}</span>
          </div>
        </div>
      )}

      {/* ===== Photos Page ===== */}
      <div
        className={`pdf-page-break bg-white rounded-lg shadow-lg overflow-hidden mt-5 ${!hasPhotos && 'border-2 border-dashed'}`}
        style={{ pageBreakBefore: hasPhotos ? 'always' : undefined, border: hasPhotos ? '1px solid #D4EBF5' : '2px dashed #D4EBF5' }}
      >
        {/* Header */}
        <div className="relative overflow-hidden" style={{ backgroundColor: '#EAF4FA' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L800,0 L800,50 Q400,80 0,55 Z" fill="#7BC4E0" opacity="0.4" />
          </svg>
          <div className="relative z-10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {companySettings.logoUrl && (
                <img src={companySettings.logoUrl} alt="" className="h-10 w-auto object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <span className="text-sm font-bold" style={{ color: '#2B7BAF' }}>תמונות מהאתר</span>
          </div>
        </div>

        {/* Photo grid */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            {quote.photos?.map((photo) => (
              <div
                key={photo.id}
                className="relative"
                style={{
                  border: '2px solid #7BC4E0',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(43,123,175,0.15)',
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '6px', background: '#EAF4FA' }}>
                  <img
                    src={photo.dataUrl}
                    alt={photo.comment || ''}
                    style={{ maxWidth: '100%', maxHeight: '240px', width: 'auto', height: 'auto', display: 'block', margin: '0 auto', background: '#fff' }}
                    crossOrigin="anonymous"
                  />
                </div>
                {/* Editable caption */}
                <div
                  data-edit-ui="true"
                  className="px-2 py-1.5 text-center"
                  style={{ borderTop: '1px solid #D4EBF5' }}
                >
                  <input
                    type="text"
                    defaultValue={photo.comment}
                    placeholder="הוסף תיאור..."
                    onBlur={(e) => onUpdatePhotoComment(photo.id, e.target.value)}
                    className="w-full text-xs text-center bg-transparent outline-none placeholder-gray-300"
                    style={{ color: '#1e3a5f' }}
                  />
                </div>
                {/* Delete overlay */}
                <button
                  data-edit-ui="true"
                  onClick={() => onDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                  title="מחק תמונה"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* Camera tile */}
            <button
              data-edit-ui="true"
              onClick={onAddPhotoCamera}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all"
              style={{ minHeight: '140px' }}
            >
              <Camera size={28} className="text-accent/50" />
              <span className="text-xs font-semibold text-accent/60">צלם תמונה</span>
            </button>

            {/* Gallery tile */}
            <button
              data-edit-ui="true"
              onClick={onAddPhoto}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all"
              style={{ minHeight: '140px' }}
            >
              <Image size={28} className="text-accent/50" />
              <span className="text-xs font-semibold text-accent/60">מהגלריה</span>
            </button>
          </div>
        </div>

        {hasPhotos && (
          <div className="px-5 py-2 text-center" style={{ borderTop: '1px solid #D4EBF5' }}>
            <span className="text-xs text-gray-400" dir="ltr">{totalPages}/{totalPages}</span>
          </div>
        )}
      </div>

      {/* ===== Hidden stamps for PDF page header/footer branding ===== */}
      <div id="pdf-header-stamp" style={{ position: 'absolute', left: '-9999px', width: '794px' }}>
        <div className="relative overflow-hidden bg-white" style={{ backgroundColor: '#EAF4FA', minHeight: '110px' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 L800,0 L800,120 Q650,180 400,140 Q150,100 0,160 Z" fill="#B8DFF0" />
            <path d="M0,0 L800,0 L800,80 Q600,150 350,110 Q100,70 0,130 Z" fill="#7BC4E0" opacity="0.6" />
          </svg>
          <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-10">
            {companySettings.logoUrl && (
              <img src={companySettings.logoUrl} alt={companySettings.name} className="h-28 w-auto object-contain" crossOrigin="anonymous" />
            )}
            <div />
          </div>
        </div>
      </div>

      <div id="pdf-footer-stamp" style={{ position: 'absolute', left: '-9999px', width: '794px' }}>
        <div className="relative overflow-hidden" style={{ minHeight: '70px' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 Q200,20 400,50 Q600,80 800,30 L800,200 L0,200 Z" fill="#B8DFF0" />
            <path d="M0,90 Q250,50 500,80 Q700,110 800,70 L800,200 L0,200 Z" fill="#7BC4E0" opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}
