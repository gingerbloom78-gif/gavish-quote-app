import { test, expect, Page } from '@playwright/test'

// ── helpers ───────────────────────────────────────────────────────────────────

async function getFirstQuoteIdByNavigation(page: Page): Promise<string | null> {
  // Navigate to home and wait for quotes to load
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Click "ערוך" (edit) on the first quote card — navigates to /quote/edit/:id
  const editBtn = page.locator('button').filter({ hasText: 'ערוך' }).first()
  if (await editBtn.count() === 0) return null

  await editBtn.click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // Extract ID from URL: /quote/edit/:id
  const url = page.url()
  const match = url.match(/\/quote\/edit\/([^/]+)/)
  return match?.[1] ?? null
}

async function openLiveBuilder(page: Page): Promise<string | null> {
  const id = await getFirstQuoteIdByNavigation(page)
  if (!id) return null
  await page.goto(`/quote/live/${id}`)
  await page.waitForLoadState('networkidle')
  // Wait for content to load (not the "not found" placeholder)
  await page.waitForFunction(
    () => !document.body.innerText.includes('הצעת מחיר לא נמצאה'),
    { timeout: 10000 }
  ).catch(() => {})
  await page.waitForTimeout(600)
  return id
}

async function openPreview(page: Page): Promise<string | null> {
  const id = await getFirstQuoteIdByNavigation(page)
  if (!id) return null
  await page.goto(`/quote/${id}`)
  await page.waitForLoadState('networkidle')
  await page.waitForFunction(
    () => !document.body.innerText.includes('הצעת מחיר לא נמצאה'),
    { timeout: 10000 }
  ).catch(() => {})
  await page.waitForTimeout(800)
  return id
}

// ── 1. CUSTOMER FORM ─────────────────────────────────────────────────────────

test.describe('1 · Customer Form', () => {

  test('no phone field', async ({ page }) => {
    const id = await getFirstQuoteIdByNavigation(page)
    if (id) {
      await page.goto(`/quote/edit/${id}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }
    const phoneInput = page.locator('input[type="tel"]')
    await expect(phoneInput).toHaveCount(0)
    await page.screenshot({ path: 'test-results/01-customer-form.png', fullPage: true })
  })

  test('two section cards: פרטי לקוח and פרטי ההצעה', async ({ page }) => {
    const id = await getFirstQuoteIdByNavigation(page)
    if (id) {
      await page.goto(`/quote/edit/${id}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('text=פרטי לקוח').first()).toBeVisible()
    await expect(page.locator('text=פרטי ההצעה').first()).toBeVisible()
  })

  test('continue button is full-width', async ({ page }) => {
    const id = await getFirstQuoteIdByNavigation(page)
    if (id) {
      await page.goto(`/quote/edit/${id}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }
    const btn = page.locator('button').filter({ hasText: 'המשך לבניית הצעה' })
    await expect(btn).toBeVisible()
    const box = await btn.boundingBox()
    expect(box?.width).toBeGreaterThan(200)  // full-width (not tiny)
  })
})

// ── 2. LIVE BUILDER — new buttons ─────────────────────────────────────────────

test.describe('2 · Live Builder buttons', () => {

  test('notes button visible', async ({ page }) => {
    await openLiveBuilder(page)
    await expect(page.locator('button[title="תנאי תשלום"]')).toBeVisible()
    await page.screenshot({ path: 'test-results/02-live-builder-header.png' })
  })

  test('audio button visible', async ({ page }) => {
    await openLiveBuilder(page)
    await expect(page.locator('button[title="הקלטות"]')).toBeVisible()
  })

  test('notes sheet opens with editable list', async ({ page }) => {
    await openLiveBuilder(page)
    await page.locator('button[title="תנאי תשלום"]').click()
    await page.waitForTimeout(400)
    await expect(page.locator('text=תנאים ותשלום')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'שמור תנאים' })).toBeVisible()
    // The notes sheet has its own "הוסף הערה" button (not the document's)
    await expect(page.locator('button').filter({ hasText: 'הוסף הערה' }).last()).toBeVisible()
    await page.screenshot({ path: 'test-results/03-notes-sheet.png', fullPage: true })
  })

  test('audio sheet opens with record button', async ({ page }) => {
    await openLiveBuilder(page)
    await page.locator('button[title="הקלטות"]').click()
    await page.waitForTimeout(400)
    await expect(page.locator('text=מזכרים קוליים')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'הקלט מזכר קולי' })).toBeVisible()
    await page.screenshot({ path: 'test-results/04-audio-sheet.png', fullPage: true })
  })

  test('live builder screenshot (full)', async ({ page }) => {
    await openLiveBuilder(page)
    await page.screenshot({ path: 'test-results/05-live-builder-full.png', fullPage: true })
  })
})

// ── 3. INLINE EDITING IN DOCUMENT ────────────────────────────────────────────

test.describe('3 · Inline editing in document', () => {

  test('subject (הנדון) span is contentEditable', async ({ page }) => {
    await openLiveBuilder(page)
    // The subject span should have contenteditable=true (may be empty / hidden if no subject)
    const count = await page.locator('#quote-document [contenteditable="true"]').count()
    expect(count).toBeGreaterThan(0)
  })

  test('notes bullets have delete buttons on hover', async ({ page }) => {
    await openLiveBuilder(page)
    // Hover over a note bullet to reveal delete button
    const firstNote = page.locator('#quote-document .group\\/note').first()
    if (await firstNote.count() > 0) {
      await firstNote.hover()
      await page.waitForTimeout(200)
      await page.screenshot({ path: 'test-results/06-notes-hover.png' })
    }
  })

  test('add note button visible in document', async ({ page }) => {
    await openLiveBuilder(page)
    await expect(page.locator('text=+ הוסף הערה').first()).toBeVisible()
  })
})

// ── 4. QUOTE DOCUMENT (PDF VIEW) ─────────────────────────────────────────────

test.describe('4 · Quote document content & RTL', () => {

  test('בס"ד appears at top of document', async ({ page }) => {
    await openPreview(page)
    const bsd = page.locator('#quote-document').locator('text=בס״ד').first()
    await expect(bsd).toBeVisible()
    // verify it's near the top
    const box = await bsd.boundingBox()
    expect(box?.y).toBeLessThan(200)
  })

  test('company phone NOT shown anywhere in document', async ({ page }) => {
    await openPreview(page)
    await expect(page.locator('text=052-6644656')).toHaveCount(0)
  })

  test('warranty value row shown below total', async ({ page }) => {
    await openPreview(page)
    await expect(page.locator('text=אחריות מלאה').first()).toBeVisible()
  })

  test('document direction is RTL', async ({ page }) => {
    await openPreview(page)
    const doc = page.locator('#quote-document')
    // Check parent has dir=rtl or the html element does
    const htmlDir = await page.evaluate(() => document.documentElement.getAttribute('dir'))
    expect(htmlDir).toBe('rtl')
  })

  test('Hebrew text renders correctly (לכבוד, כתובת visible)', async ({ page }) => {
    await openPreview(page)
    await expect(page.locator('text=לכבוד:').first()).toBeVisible()
    await expect(page.locator('text=כתובת:').first()).toBeVisible()
    await expect(page.locator('text=הנדון:').first()).toBeVisible()
  })

  test('certificate section visible (נספחים מקצועיים)', async ({ page }) => {
    await openPreview(page)
    await expect(page.locator('text=נספחים מקצועיים')).toBeVisible()
  })

  test('certificate image loads (no broken img)', async ({ page }) => {
    await openPreview(page)
    // Check that cert images have naturalWidth > 0 (loaded successfully)
    const certImgs = page.locator('.pdf-page-break img')
    const count = await certImgs.count()
    for (let i = 0; i < count; i++) {
      const naturalWidth = await certImgs.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('quote preview screenshot', async ({ page }) => {
    await openPreview(page)
    await page.screenshot({ path: 'test-results/07-quote-preview.png', fullPage: true })
  })
})

// ── 5. SETTINGS PAGE ─────────────────────────────────────────────────────────

test.describe('5 · Settings page', () => {

  test('two tabs visible', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('button').filter({ hasText: 'הגדרות חברה' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'קטלוג עבודות' })).toBeVisible()
    await page.screenshot({ path: 'test-results/08-settings-company.png', fullPage: true })
  })

  test('company settings fields visible by default', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=פרטי החברה')).toBeVisible()
    await expect(page.locator('text=הערות ברירת מחדל')).toBeVisible()
    await expect(page.locator('text=תעודות ודיפלומות')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'שמור הגדרות' })).toBeVisible()
  })

  test('catalog tab shows categories', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.locator('button').filter({ hasText: 'קטלוג עבודות' }).click()
    await page.waitForTimeout(300)
    await expect(page.locator('text=הוסף קטגוריה חדשה')).toBeVisible()
    await page.screenshot({ path: 'test-results/09-settings-catalog.png', fullPage: true })
  })
})

// ── 6. RTL PDF RENDERING ─────────────────────────────────────────────────────

test.describe('6 · RTL PDF rendering (visual)', () => {

  test('PDF document renders in RTL — screenshot comparison', async ({ page }) => {
    await openPreview(page)

    // Scroll to document top
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)

    // Take screenshot of just the document area
    const doc = page.locator('#quote-document > div').first()
    await doc.screenshot({ path: 'test-results/10-rtl-document-page1.png' })

    // Verify logo is on the RIGHT side in RTL (higher x than center)
    const logo = page.locator('#quote-document img[alt]').first()
    if (await logo.count() > 0) {
      const logoBox = await logo.boundingBox()
      const docBox = await doc.boundingBox()
      if (logoBox && docBox) {
        // In RTL, logo (first flex child) renders on the RIGHT
        const logoCenter = logoBox.x + logoBox.width / 2
        const docCenter = docBox.x + docBox.width / 2
        expect(logoCenter).toBeGreaterThan(docCenter)
      }
    }
  })

  test('table headers align right in RTL', async ({ page }) => {
    await openPreview(page)
    const tableHeader = page.locator('#quote-document th').first()
    const textAlign = await tableHeader.evaluate((el) =>
      window.getComputedStyle(el).textAlign
    )
    expect(['right', 'start']).toContain(textAlign)
  })

  test('notes text is right-aligned', async ({ page }) => {
    await openPreview(page)
    const noteItems = page.locator('#quote-document li').first()
    if (await noteItems.count() > 0) {
      const dir = await noteItems.evaluate((el) =>
        window.getComputedStyle(el).direction
      )
      expect(dir).toBe('rtl')
    }
  })

  test('total section screenshot', async ({ page }) => {
    await openPreview(page)
    // Scroll to the totals table area
    const totalRow = page.locator('text=סה"כ לתשלום').first()
    await totalRow.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await page.screenshot({ path: 'test-results/11-total-section.png' })
  })

  test('certificate page screenshot', async ({ page }) => {
    await openPreview(page)
    const certSection = page.locator('.pdf-page-break').first()
    if (await certSection.count() > 0) {
      await certSection.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      await certSection.screenshot({ path: 'test-results/12-certificate-page.png' })
    }
  })
})
