# גביש - אפליקציית הצעות מחיר

Mobile-first quote builder for **גביש איטום בע"מ** — a construction/waterproofing company.

## Features

- **Dashboard** — KPI cards (revenue, approved, total), status filters, quote list
- **3-Step Quote Wizard** — customer details → work items → pricing summary
- **Smart Catalog** — 6 categories with 23 predefined work items (bullets, base prices)
- **Quote Preview** — premium document layout matching professional PDF style
- **WhatsApp Share** — deep link with pre-filled message to client
- **Auto Calculations** — subtotal, 18% VAT, total
- **Hebrew RTL** — fully right-to-left interface
- **PWA Ready** — manifest, theme color, mobile-optimized viewport

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- lucide-react icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) on your phone or in a mobile-sized browser window.

## Project Structure

```
src/
├── types/          # TypeScript interfaces
├── data/           # Catalog & company settings
├── context/        # React Context state management
├── utils/          # Calculations, formatters, PDF stub
├── components/
│   ├── layout/     # AppShell, Header, BottomBar
│   ├── dashboard/  # KpiCards, QuoteList, QuoteCard
│   ├── wizard/     # StepIndicator, CustomerForm, CatalogPicker, LineItemCard, PricingSummary
│   └── preview/    # QuoteDocument, ShareActions
└── pages/          # Dashboard, QuoteWizard, QuotePreview
```

## Ready for Future Integration

- **Database**: Replace Context state with API calls (Supabase, Firebase, etc.)
- **PDF Export**: `src/utils/pdfExport.ts` has a stub — integrate html2pdf.js, jsPDF, or PDFMonkey
- **Voice Input**: Placeholder for Whisper API voice-to-data
- **Authentication**: Add auth layer as needed
