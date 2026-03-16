import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { Quote } from '../types'

const A4_W_MM = 210
const A4_H_MM = 297
const RENDER_SCALE = 2
const DOC_WIDTH_PX = 794

/* ── oklch/oklab -> rgb conversion (html2canvas can't parse modern CSS colors) ── */

function colorToRgba(color: string): string {
  const c = document.createElement('canvas')
  c.width = 1
  c.height = 1
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
}

const MODERN_COLOR_RE = /oklch\([^)]+\)|oklab\([^)]+\)|color\(srgb[^)]*\)/g

function replaceModernColors(css: string): string {
  return css.replace(MODERN_COLOR_RE, (match) => {
    try { return colorToRgba(match) } catch { return match }
  })
}

function fixClonedStyles(clonedDoc: Document) {
  for (const style of clonedDoc.querySelectorAll('style')) {
    if (style.textContent && MODERN_COLOR_RE.test(style.textContent)) {
      style.textContent = replaceModernColors(style.textContent)
    }
  }

  const colorProps = [
    'color', 'backgroundColor', 'borderColor',
    'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'boxShadow', 'textDecorationColor',
  ] as const

  const root = clonedDoc.getElementById('quote-document')
  if (!root) return

  for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
    const computed = getComputedStyle(el)
    for (const prop of colorProps) {
      const val = computed[prop as keyof CSSStyleDeclaration] as string
      if (val && typeof val === 'string' && MODERN_COLOR_RE.test(val)) {
        ;(el.style as any)[prop] = replaceModernColors(val)
      }
    }
  }
}

/* ── Smart page-break algorithm ── */

interface Region { top: number; bottom: number }

function findSafeCut(
  y: number,
  maxY: number,
  avoidRegions: Region[],
  minPageFraction: number,
): number {
  let bestCut = maxY
  for (const r of avoidRegions) {
    if (r.top < maxY && r.bottom > maxY && r.top > y) {
      bestCut = Math.min(bestCut, r.top)
    }
  }
  if (bestCut - y < (maxY - y) * minPageFraction) {
    bestCut = maxY
  }
  return bestCut
}

function findSafeBreaks(
  totalHeight: number,
  firstPageH: number,
  subsequentPageH: number,
  avoidRegions: Region[],
): number[] {
  const breaks: number[] = []
  let y = 0
  let isFirst = true

  while (true) {
    const pageH = isFirst ? firstPageH : subsequentPageH
    if (y + pageH >= totalHeight) break

    const cut = findSafeCut(y, y + pageH, avoidRegions, 0.4)
    breaks.push(cut)
    y = cut
    isFirst = false
  }
  return breaks
}

/* ── html2canvas options shared by all renders ── */

function canvasOpts(origEl: HTMLElement, oncloneCb?: (doc: Document, el: HTMLElement) => void) {
  return {
    scale: RENDER_SCALE,
    useCORS: true,
    letterRendering: true,
    scrollY: 0,
    windowWidth: DOC_WIDTH_PX,
    onclone: (doc: Document, el: HTMLElement) => {
      el.style.transform = 'none'
      doc.documentElement.setAttribute('dir', 'rtl')

      const LAYOUT_DISPLAYS = new Set([
        'table', 'table-row', 'table-row-group',
        'table-header-group', 'table-footer-group',
        'table-column', 'table-column-group',
        'flex', 'inline-flex', 'grid', 'inline-grid',
      ])

      // origEl is the exact element passed to html2canvas — same root as el (the clone).
      // This ensures origNodes[i] and cloneNodes[i] correspond to the same element.
      const origNodes = [origEl, ...Array.from(origEl.querySelectorAll<HTMLElement>('*'))]
      const cloneNodes = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))]
      const len = Math.min(origNodes.length, cloneNodes.length)

      for (let i = 0; i < len; i++) {
        const origCs = window.getComputedStyle(origNodes[i])
        if (origCs.direction === 'rtl') {
          if (LAYOUT_DISPLAYS.has(origCs.display)) {
            // Explicitly pin rtl on layout containers so they can't inherit ltr
            // from a parent text element that was set to ltr below.
            cloneNodes[i].style.direction = 'rtl'
          } else {
            // Text/block element: force ltr to prevent iOS WebKit fillText() overlap bug.
            cloneNodes[i].style.direction = 'ltr'
            // 'start' in RTL context = right-aligned; pin it so ltr doesn't left-align it.
            if (origCs.textAlign === 'start' || origCs.textAlign === '-webkit-auto') {
              cloneNodes[i].style.textAlign = 'right'
            }
          }
        }
      }

      // Remove overflow:hidden so html2canvas doesn't clip wave-background wrappers
      for (const child of [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))]) {
        const ov = child.style.overflow || getComputedStyle(child).overflow
        if (ov === 'hidden') child.style.overflow = 'visible'
      }

      fixClonedStyles(doc)
      oncloneCb?.(doc, el)
    },
  }
}

async function renderStamp(el: HTMLElement): Promise<HTMLCanvasElement> {
  const saved = el.style.cssText
  el.style.position = 'static'
  el.style.left = '0'
  const canvas = await html2canvas(el, canvasOpts(el))
  el.style.cssText = saved
  return canvas
}

function buildPage(
  pdf: jsPDF,
  contentCanvas: HTMLCanvasElement,
  yStart: number,
  sliceH: number,
  headerCanvas: HTMLCanvasElement | null,
  footerCanvas: HTMLCanvasElement | null,
  fullPageH: number,
  pageNum: number,
  totalPages: number,
) {
  const w = contentCanvas.width

  if (!headerCanvas || !footerCanvas) {
    const pg = document.createElement('canvas')
    pg.width = w
    pg.height = fullPageH   // Always use full A4-proportional height
    const ctx = pg.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, fullPageH)
    ctx.drawImage(contentCanvas, 0, yStart, w, sliceH, 0, 0, w, sliceH)
    const imgData = pg.toDataURL('image/jpeg', 0.98)
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM)
    return
  }

  const hdrH = headerCanvas.height
  const ftrH = footerCanvas.height

  const pg = document.createElement('canvas')
  pg.width = w
  pg.height = fullPageH
  const ctx = pg.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, fullPageH)

  ctx.drawImage(headerCanvas, 0, 0)

  ctx.drawImage(contentCanvas, 0, yStart, w, sliceH, 0, hdrH, w, sliceH)

  ctx.drawImage(footerCanvas, 0, fullPageH - ftrH)

  const imgData = pg.toDataURL('image/jpeg', 0.98)
  pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM)

  pdf.setFontSize(8)
  pdf.setTextColor(30, 58, 95)
  const pageLabel = `${pageNum}/${totalPages}`
  pdf.text(pageLabel, 10, A4_H_MM - 4)
}

/* ── Public API ── */

export async function generatePdfBlob(_quote: Quote): Promise<Blob> {
  const root = document.getElementById('quote-document')
  if (!root) {
    throw new Error('[PDF] quote-document element not found')
  }

  // Temporarily remove any parent transform (e.g. scale(0.45) on mobile preview)
  // so html2canvas getBoundingClientRect measurements are accurate.
  const parent = root.parentElement as HTMLElement | null
  const savedTransform = parent?.style.transform ?? ''
  if (parent) parent.style.transform = 'none'

  try {
    // Ensure web fonts (Heebo) are fully loaded before canvas capture
    await document.fonts.ready

    const quoteBody = root.children[0] as HTMLElement
    const certEls = Array.from(root.children).filter(
      (el) => el.classList.contains('pdf-page-break'),
    ) as HTMLElement[]

    // 1. Render header/footer stamps from hidden elements
    const hdrStamp = document.getElementById('pdf-header-stamp')
    const ftrStamp = document.getElementById('pdf-footer-stamp')

    let headerCanvas: HTMLCanvasElement | null = null
    let footerCanvas: HTMLCanvasElement | null = null

    if (hdrStamp) headerCanvas = await renderStamp(hdrStamp)
    if (ftrStamp) footerCanvas = await renderStamp(ftrStamp)

    // 2. Measure avoid-break element positions
    const bodyRect = quoteBody.getBoundingClientRect()
    const avoidRegions: Region[] = Array.from(
      quoteBody.querySelectorAll('.avoid-break'),
    ).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        top: (r.top - bodyRect.top) * RENDER_SCALE,
        bottom: (r.bottom - bodyRect.top) * RENDER_SCALE,
      }
    })

    // 3. Render full quote body as one tall canvas
    const bodyCanvas = await html2canvas(quoteBody, canvasOpts(quoteBody))

    // 4. Calculate page heights
    const fullPageH = Math.floor(bodyCanvas.width * (A4_H_MM / A4_W_MM))
    const hdrH = headerCanvas?.height ?? 0
    const ftrH = footerCanvas?.height ?? 0
    const contentPageH = fullPageH - hdrH - ftrH

    // Page 1 uses full A4 height (header/footer baked into the content).
    // Pages 2+ use reduced height (content area between stamp header/footer).
    const breaks = findSafeBreaks(
      bodyCanvas.height,
      fullPageH,
      contentPageH,
      avoidRegions,
    )

    const totalPages = (breaks.length + 1) + certEls.length

    // 5. Build PDF pages
    const pdf = new jsPDF('portrait', 'mm', 'a4')
    const boundaries = [0, ...breaks, bodyCanvas.height]

    for (let i = 0; i < boundaries.length - 1; i++) {
      if (i > 0) pdf.addPage()

      const yStart = boundaries[i]
      const sliceH = boundaries[i + 1] - yStart
      if (sliceH <= 0) continue

      if (i === 0) {
        buildPage(pdf, bodyCanvas, yStart, sliceH, null, null, fullPageH, i + 1, totalPages)
      } else {
        buildPage(pdf, bodyCanvas, yStart, sliceH, headerCanvas, footerCanvas, fullPageH, i + 1, totalPages)
      }
    }

    // 6. Render each certificate as its own full page
    for (const certEl of certEls) {
      pdf.addPage()
      const certCanvas = await html2canvas(certEl, canvasOpts(certEl))
      const imgData = certCanvas.toDataURL('image/jpeg', 0.98)
      const imgH = Math.min((certCanvas.height / certCanvas.width) * A4_W_MM, A4_H_MM)
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, imgH)
    }

    return pdf.output('blob')
  } finally {
    if (parent) parent.style.transform = savedTransform
  }
}

export async function generatePdf(quote: Quote): Promise<void> {
  try {
    const blob = await generatePdfBlob(quote)
    const filename = `הצעת_מחיר_${quote.quoteNumber}_${quote.clientName || 'טיוטה'}.pdf`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('[PDF] generation failed:', err)
    throw err
  }
}
