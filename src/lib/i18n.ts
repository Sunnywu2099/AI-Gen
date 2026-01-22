export type Locale = 'en' | 'de' | 'fr' | 'es' | 'it';

export const translations = {
  en: {
    title: "AI Design Pool",
    subtitle: "Transform your backyard into a paradise with our AI",
    uploadTitle: "Upload your backyard photo",
    uploadDesc: "Drag and drop or click to upload",
    generateBtn: "Generate Pool Design",
    downloadBtn: "Download Result",
    processing: "Designing your pool...",
    error: "Something went wrong. Please try again.",
    tryAgain: "Try Another Photo",
    before: "Before",
    after: "After"
  },
  de: {
    title: "AI Design Pool",
    subtitle: "Verwandeln Sie Ihren Garten in ein Paradies mit unserer KI",
    uploadTitle: "Laden Sie Ihr Gartenfoto hoch",
    uploadDesc: "Ziehen und ablegen oder klicken zum Hochladen",
    generateBtn: "Pool-Design generieren",
    downloadBtn: "Ergebnis herunterladen",
    processing: "Ihr Pool wird entworfen...",
    error: "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.",
    tryAgain: "Anderes Foto versuchen",
    before: "Vorher",
    after: "Nachher"
  },
  fr: {
    title: "AI Design Piscine",
    subtitle: "Transformez votre jardin en paradis avec notre IA",
    uploadTitle: "Téléchargez la photo de votre jardin",
    uploadDesc: "Glissez-déposez ou cliquez pour télécharger",
    generateBtn: "Générer le design",
    downloadBtn: "Télécharger le résultat",
    processing: "Conception de votre piscine...",
    error: "Une erreur s'est produite. Veuillez réessayer.",
    tryAgain: "Essayer une autre photo",
    before: "Avant",
    after: "Après"
  },
  es: {
    title: "AI Diseño de Piscinas",
    subtitle: "Transforma tu jardín en un paraíso con nuestra IA",
    uploadTitle: "Sube la foto de tu jardín",
    uploadDesc: "Arrastra y suelta o haz clic para subir",
    generateBtn: "Generar diseño",
    downloadBtn: "Descargar resultado",
    processing: "Diseñando tu piscina...",
    error: "Algo salió mal. Por favor, inténtalo de nuevo.",
    tryAgain: "Probar otra foto",
    before: "Antes",
    after: "Después"
  },
  it: {
    title: "AI Design Piscina",
    subtitle: "Trasforma il tuo giardino in un paradiso con la nostra IA",
    uploadTitle: "Carica la foto del tuo giardino",
    uploadDesc: "Trascina e rilascia o clicca per caricare",
    generateBtn: "Genera design",
    downloadBtn: "Scarica risultato",
    processing: "Progettazione della tua piscina...",
    error: "Qualcosa è andato storto. Riprova.",
    tryAgain: "Prova un'altra foto",
    before: "Prima",
    after: "Dopo"
  }
} as const;

export const defaultLocale: Locale = 'en';

export type Translation = typeof translations['en'];

export function getDictionary(locale: string): Translation {
  if (locale === 'eu') return translations['en']; // Handle 'eu' as 'en'
  const dict = translations[locale as Locale] || translations[defaultLocale];
  return dict as Translation;
}
