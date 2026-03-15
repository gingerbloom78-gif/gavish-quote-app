import type { CompanySettings } from '../types'

export const companySettings: CompanySettings = {
  name: '״גביש איטום״ בע״מ',
  legalName: 'גביש איטום בע"מ',
  contactPerson: 'אברהם חרר',
  phone: '052-6644656',
  email: 'GAVISH1000@GMAIL.COM',
  website: 'GAVISH-LTD.CO.IL',
  tagline: 'איטום וחיזוק מבנים',
  credentials: 'הנדסאי בניין, איטום מורשה מכון התקנים, קבלן רשום 35096',
  taxId: '35096',
  vatRate: 0.18,
  logoUrl: '/logo.png',
  signatureUrl: '/signature.png',
  defaultNotes: [
    'תנאי תשלום: בסיום העבודה.',
    'הצעת המחיר הנ"ל כוללת את כל החומרים הדרושים לביצוע העבודה.',
    'שמירה על הניקיון בזמן העבודות וניקיון לאחר סיום העבודות ופינוי הפסולת לאתר מטמנה מורשת.',
    'מועד תחילת העבודה - בתיאום מראש, מותנית בהזמנת עבודה חתומה או אישור בדוא"ל חוזר מההצעה הנ"ל.',
  ],
  legalLine: 'עם חתימת מזמין העבודה, תהפוך הצעת מחיר זו להזמנת עבודה.',
  certificates: [
    {
      id: 'cert-1',
      title: 'תעודת אוטם מורשה - מרכז הבנייה הישראלי',
      imageUrl: '/certificates/abraham-certificate.png',
    },
    {
      id: 'cert-2',
      title: 'רישיון קבלן רשום - משרד הבינוי והשיכון',
      imageUrl: '/certificates/contractor-license.png',
    },
    {
      id: 'cert-3',
      title: 'דיפלומה להנדסאי בניין - מה"ט',
      imageUrl: '/certificates/diploma.png',
    },
  ],
}
