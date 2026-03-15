import { test, expect } from '@playwright/test'

test('app loads and shows dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=הצעות מחיר')).toBeVisible({ timeout: 10_000 })
})

test('PDF downloads from quote preview', async ({ page }) => {
  await page.goto('/')
  // Click "צפה" (View) on the first quote card to open its preview
  const firstQuoteLink = page.locator('button:has-text("צפה")').first()
  await firstQuoteLink.waitFor({ timeout: 10_000 })
  await firstQuoteLink.click()

  // Wait for the download button
  const pdfBtn = page.locator('button:has-text("הורד PDF")')
  await pdfBtn.waitFor({ timeout: 10_000 })

  // Capture the download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    pdfBtn.click(),
  ])

  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  // Verify it is a real PDF (starts with %PDF magic bytes)
  const { readFileSync } = await import('fs')
  const buf = readFileSync(filePath!)
  expect(buf.slice(0, 4).toString()).toBe('%PDF')
  // Must be at least 50 KB — a valid multi-page PDF
  expect(buf.byteLength).toBeGreaterThan(50_000)
})

test('WhatsApp button does not crash on mobile', async ({ page }) => {
  // Grant permission to suppress system share sheet
  await page.goto('/')
  const firstQuoteLink = page.locator('button:has-text("צפה")').first()
  await firstQuoteLink.waitFor({ timeout: 10_000 })
  await firstQuoteLink.click()

  const waBtn = page.locator('button:has-text("שלח בוואטסאפ")')
  await waBtn.waitFor({ timeout: 10_000 })

  // On Playwright desktop, canShare is unavailable → falls back to window.open
  // Test that clicking doesn't throw and button re-enables
  await waBtn.click()
  // Button should re-enable (not stuck in loading) after fallback
  await expect(waBtn).toBeEnabled({ timeout: 15_000 })
})
