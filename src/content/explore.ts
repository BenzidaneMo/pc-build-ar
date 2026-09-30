// «اكتشف القطع»: what each component is, what it does, and what it looks like today.
// The 2007 parts (the lessons' parts): photos and callouts from the original EXPLORE views
// (tools/extract_explore.py -> explore.json + public/media/explore/). Today's parts: Wikimedia
// Commons photos (tools/fetch_photos.py -> photoCredits.json + public/media/explore/modern/),
// callouts placed here. Texts written for students; to be reviewed by a teacher.
import views from './explore.json'
import credits from './photoCredits.json'
import photoSizes from './explorePhotos.json'

export interface ExploreFeature { ar: string; fr: string }

/** The two tabs of the catalog: the 2007 parts of the lessons, and today's parts. */
export type Era = 'classic' | 'modern'
export const eras: { id: Era; tab: string }[] = [{ id: 'classic', tab: 'حاسوب 2007' }, { id: 'modern', tab: 'حاسوب اليوم' }]
/** Today's parts are grouped by topic (their `lesson` is the topic's number). */
export const todayTopics = [
  'المعالج ومقبسه', 'الذاكرة والتخزين M.2', 'التبريد', 'اللوحة الأم والصندوق', 'التغذية وكوابلها',
  'الرسوميات والتخزين SATA', 'الواجهة الأمامية والمراوح', 'المنافذ والأجهزة', 'الإعدادات',
]

export interface ExploreEntry {
  id: string
  /** Default: a 2007 part. */
  era?: Era
  lesson: number
  name: { ar: string; fr: string; en: string }
  /** Classic: card image in media/thumbs/ (also the photo when there are no explore views).
   *  Today's: the first photo, unless `art` (a drawing in media/explore/modern/) stands in for photos. */
  thumb?: string
  art?: string
  /** Key in explore.json (the legacy explore<Part>.swf). */
  swf?: string
  /** Without explore views: the part's image in media/images/. */
  image?: string
  /** Captions for views without a name (cables and peripherals: Photo1, Photo2…). */
  captions?: string[]
  what: string
  role: string
  /** How it looks in today's computers (classic parts). */
  today?: string
  /** What it replaced (today's parts). */
  before?: string
  fact?: string
  /** The same part in the other tab (then and now). */
  pair?: string
}

/** Credit of a Commons photo (tools/fetch_photos.py). */
export interface PhotoCredit { title: string; author: string; license: string; licenseUrl: string; source: string }
/** Credits of the photos that have one (a photo put there by hand may have none). */
export const photoCredits = credits as Record<string, PhotoCredit>
/** Every photo of today's parts and its size [w, h] (tools/fetch_photos.py sizes). */
export const explorePhotos = photoSizes as unknown as Record<string, [number, number]>

export interface ExploreView {
  view: string
  img: string
  w: number
  h: number
  callouts: { en: string; rect: [number, number, number, number] }[]
}

export const exploreViews = views as unknown as Record<string, ExploreView[]>

export const viewNames: Record<string, string> = {
  Front: 'من الأمام',
  Back: 'من الخلف',
  Top: 'من الأعلى',
  Bottom: 'من الأسفل',
  Right: 'من الجانب',
  Left: 'من الجانب الآخر',
}

/** The original callout labels (English, as in the photos) in Arabic and French. */
export const features: Record<string, ExploreFeature> = {
  'AC Power Connector': { ar: 'مقبس كابل الكهرباء', fr: "Prise d'alimentation secteur" },
  'ATX Power Connector': { ar: 'موصّل التغذية الرئيسي ATX', fr: "Connecteur d'alimentation ATX" },
  'Analog Audio Connectors': { ar: 'موصّلات الصوت التناظري', fr: 'Connecteurs audio analogiques' },
  'Aux Power Connector': { ar: 'موصّل التغذية الإضافي للمعالج', fr: "Connecteur d'alimentation auxiliaire" },
  Battery: { ar: 'البطارية: تحفظ الساعة وإعدادات BIOS', fr: 'Pile CMOS' },
  'Berg Power Connector': { ar: 'موصّل التغذية الصغير Berg', fr: "Connecteur d'alimentation Berg" },
  'CPU Contacts': { ar: 'نقاط تلامس المعالج', fr: 'Contacts du processeur' },
  'CPU Socket': { ar: 'مقبس المعالج', fr: 'Socket du processeur' },
  'Chipset with Heatsink': { ar: 'الشرائح (Chipset) تحت مشتت حراري', fr: 'Chipset avec dissipateur' },
  'Connection 1 Indicator': { ar: 'علامة الطرف 1 (المثلث)', fr: 'Repère de la broche 1' },
  'DIMM Connector': { ar: 'أطراف التوصيل الذهبية', fr: 'Connecteur DIMM' },
  'DVD Tray': { ar: 'درج القرص', fr: 'Tiroir du disque' },
  'Digital Audio Connectors': { ar: 'موصّلات الصوت الرقمي', fr: 'Connecteurs audio numériques' },
  'Drive Specifications': { ar: 'ملصق مواصفات القرص (السعة، الطراز)', fr: 'Étiquette des caractéristiques' },
  'Eject Button': { ar: 'زر الإخراج', fr: "Bouton d'éjection" },
  'Emergency Eject': { ar: 'ثقب الإخراج الاضطراري', fr: "Trou d'éjection d'urgence" },
  'Ethernet Port': { ar: 'منفذ الشبكة RJ45', fr: 'Port Ethernet (RJ45)' },
  'Exhaust Vent': { ar: 'مروحة إخراج الهواء الساخن', fr: "Grille d'extraction (ventilateur)" },
  'FireWire Connectors': { ar: 'موصّلات FireWire الداخلية', fr: 'Connecteurs FireWire internes' },
  'Firewire Port': { ar: 'منفذ FireWire', fr: 'Port FireWire' },
  'Floppy Connector': { ar: 'موصّل كابل القرص المرن', fr: 'Connecteur disquette' },
  'Floppy Disk Slot': { ar: 'فتحة إدخال القرص المرن', fr: 'Fente de la disquette' },
  'Front Panel Connectors': { ar: 'موصّلات الواجهة الأمامية (زر التشغيل، الأضواء)', fr: 'Connecteurs du panneau avant' },
  'Graphic Processor & Heat Sink': { ar: 'معالج الرسوميات (GPU) تحت مشتته الحراري', fr: 'Processeur graphique et dissipateur' },
  'Headphone Jack': { ar: 'مخرج السماعات', fr: 'Prise casque' },
  'Heat Sink Fan Connector': { ar: 'موصّل مروحة المشتت الحراري', fr: 'Connecteur du ventilateur' },
  'I/O Controller': { ar: 'متحكّم الإدخال والإخراج', fr: "Contrôleur d'entrées/sorties" },
  'I/O Ports': { ar: 'المنافذ الخلفية (إدخال/إخراج)', fr: "Ports d'entrées/sorties" },
  'Jumper Pins': { ar: 'دبابيس الوصلات (Jumpers)', fr: 'Cavaliers (jumpers)' },
  'Jumper Settings': { ar: 'جدول إعدادات الوصلات', fr: 'Configuration des cavaliers' },
  'Latch Notches': { ar: 'شقوق المزلاج الجانبية', fr: 'Encoches de verrouillage' },
  'Line In Jack': { ar: 'مدخل الصوت', fr: 'Entrée ligne' },
  'Microphone Jack': { ar: 'مدخل الميكروفون', fr: 'Prise micro' },
  'Molex Power Connector': { ar: 'موصّل التغذية Molex', fr: "Connecteur d'alimentation Molex" },
  'Open/Close Button': { ar: 'زر فتح وغلق الدرج', fr: 'Bouton ouvrir/fermer' },
  'PATA Connector': { ar: 'موصّل PATA (IDE)', fr: 'Connecteur PATA (IDE)' },
  'PC Mounting Bracket': { ar: 'الحامل المعدني (يُثبَّت ببرغي)', fr: 'Équerre de fixation' },
  'PCI Connector': { ar: 'أطراف التوصيل PCI', fr: 'Connecteur PCI' },
  'PCI Slots': { ar: 'منافذ التوسعة PCI', fr: 'Slots PCI' },
  'PCIe x 16 Connector': { ar: 'أطراف التوصيل PCIe x16', fr: 'Connecteur PCIe x16' },
  'PCIe x1 Connector': { ar: 'أطراف التوصيل PCIe x1', fr: 'Connecteur PCIe x1' },
  'PCIe x1 Slots': { ar: 'منافذ التوسعة PCIe x1', fr: 'Slots PCIe x1' },
  'PCIe x16 Slot': { ar: 'منفذ PCIe x16 (لبطاقة الرسوميات)', fr: 'Slot PCIe x16' },
  'PS/2 Keyboard Port': { ar: 'منفذ لوحة المفاتيح PS/2 (بنفسجي)', fr: 'Port PS/2 clavier' },
  'PS/2 Mouse Port': { ar: 'منفذ الفأرة PS/2 (أخضر)', fr: 'Port PS/2 souris' },
  'Parallel Port': { ar: 'المنفذ المتوازي (للطابعات القديمة)', fr: 'Port parallèle' },
  'Power Harness': { ar: 'حزمة أسلاك التغذية', fr: 'Faisceau de câbles' },
  'Power Specifications': { ar: 'ملصق المواصفات (القدرة بالواط)', fr: 'Étiquette des caractéristiques' },
  'RAM Slots': { ar: 'منافذ الذاكرة الحية', fr: 'Slots mémoire' },
  'SATA Connectors': { ar: 'موصّلات SATA', fr: 'Connecteurs SATA' },
  'SATA Data Connector': { ar: 'موصّل بيانات SATA', fr: 'Connecteur de données SATA' },
  'SATA Power Connector': { ar: 'موصّل تغذية SATA', fr: "Connecteur d'alimentation SATA" },
  'Serial Port': { ar: 'المنفذ التسلسلي COM', fr: 'Port série' },
  'Single Key Notch': { ar: 'شقّ التوجيه (يمنع القلب)', fr: 'Encoche détrompeur' },
  'Status Indicator LED': { ar: 'ضوء الحالة', fr: "Voyant d'activité" },
  'Thermal Compound': { ar: 'المعجون الحراري', fr: 'Pâte thermique' },
  'USB Connectors': { ar: 'موصّلات USB الداخلية', fr: 'Connecteurs USB internes' },
  'USB Ports': { ar: 'منافذ USB', fr: 'Ports USB' },
  'VGA Port': { ar: 'منفذ الشاشة VGA', fr: 'Port VGA' },
  VRAM: { ar: 'ذاكرة الرسوميات VRAM', fr: 'Mémoire vidéo (VRAM)' },
  'Video Port': { ar: 'منفذ الشاشة DVI', fr: 'Port vidéo (DVI)' },
  'Wireless Antenna Connector': { ar: 'موصّل الهوائي', fr: "Connecteur d'antenne" },
  // today's parts
  'VRM Heatsink': { ar: 'مشتت دارة تغذية المعالج (VRM)', fr: 'Dissipateur du VRM' },
  VRM: { ar: 'دارة تغذية المعالج (VRM)', fr: "Étage d'alimentation (VRM)" },
  Capacitors: { ar: 'مكثّفات صغيرة', fr: 'Condensateurs' },
  'Socket Pins': { ar: 'دبابيس المقبس الدقيقة', fr: 'Broches du socket' },
  'Load Plate': { ar: 'الغطاء المعدني', fr: 'Plaque de maintien' },
  'Retention Lever': { ar: 'ذراع التثبيت', fr: 'Levier de verrouillage' },
  'Socket Screws': { ar: 'براغي تثبيت إطار المقبس', fr: 'Vis du cadre' },
  'Memory Chips': { ar: 'رقاقات الذاكرة', fr: 'Puces mémoire' },
  PMIC: { ar: 'منظّم الجهد PMIC (جديد في DDR5)', fr: 'Régulateur PMIC' },
  'M.2 Connector (M key)': { ar: 'أطراف التوصيل M.2 (مفتاح M)', fr: 'Connecteur M.2 (clé M)' },
  'Mounting Notch': { ar: 'نصف الدائرة لبرغي التثبيت', fr: 'Encoche de fixation' },
  'Modular Sockets': { ar: 'مقابس الكوابل المعيارية', fr: 'Prises modulaires' },
  'Modular Cables': { ar: 'الكوابل المعيارية', fr: 'Câbles modulaires' },
  'Cooling Fan': { ar: 'مروحة التبريد', fr: 'Ventilateur' },
  'Power LED Pins': { ar: 'دبوسا ضوء التشغيل (POW LED)', fr: "LED d'alimentation" },
  'Power Switch Pins': { ar: 'دبوسا زر التشغيل (ON/OFF)', fr: 'Bouton marche' },
  'HDD LED Pins': { ar: 'دبوسا ضوء القرص (HLED)', fr: 'LED disque' },
  'Reset Switch Pins': { ar: 'دبوسا زر إعادة التشغيل (RST)', fr: 'Bouton reset' },
  'Speaker Pins': { ar: 'دبابيس مكبّر الصوت الصغير (SPK)', fr: 'Haut-parleur (SPK)' },
  'Pump Block': { ar: 'رأس المضخّة (فوق المعالج)', fr: 'Bloc pompe (waterblock)' },
  Tubes: { ar: 'أنبوبا السائل', fr: 'Tuyaux' },
  'Radiator & Fans': { ar: 'المبرِّد (radiateur) ومراوحه', fr: 'Radiateur et ventilateurs' },
}

/** Callouts on the Commons photos (% of the photo), by photo file name. */
const photoCallouts: Record<string, ExploreView['callouts']> = {
  'modernBoard-1': [
    { en: 'CPU Socket', rect: [23, 30, 25, 22] },
    { en: 'RAM Slots', rect: [15, 13, 40, 14] },
    { en: 'ATX Power Connector', rect: [33, 7, 13, 7] },
    { en: 'Aux Power Connector', rect: [12, 61, 5, 10] },
    { en: 'VRM Heatsink', rect: [11, 33, 9, 28] },
    { en: 'PCIe x16 Slot', rect: [59, 37, 4, 39] },
    { en: 'PCIe x1 Slots', rect: [53, 63, 4, 13] },
    { en: 'SATA Connectors', rect: [60, 6, 13, 7] },
    { en: 'Battery', rect: [64, 54, 6, 8] },
    { en: 'I/O Ports', rect: [8, 64, 47, 25] },
  ],
  'gpu-2': [
    { en: 'PC Mounting Bracket', rect: [0, 14, 6, 86] },
    { en: 'Cooling Fan', rect: [37, 5, 30, 71] },
    { en: 'PCIe x 16 Connector', rect: [17, 82, 27, 10] },
  ],
  'gpu-1': [
    { en: 'PC Mounting Bracket', rect: [0, 14, 10, 32] },
    { en: 'Cooling Fan', rect: [50, 30, 38, 42] },
    { en: 'Graphic Processor & Heat Sink', rect: [42, 60, 24, 20] },
  ],
  'lgaCpu-2': [
    { en: 'CPU Contacts', rect: [4, 20, 24, 55] },
    { en: 'Latch Notches', rect: [17, 0, 8, 5] },
    { en: 'Capacitors', rect: [31, 20, 38, 56] },
    { en: 'Connection 1 Indicator', rect: [92, 93, 7, 6] },
  ],
  'cpuSocket-1': [
    { en: 'Socket Pins', rect: [31, 25, 38, 43] },
    { en: 'Load Plate', rect: [26, 70, 50, 12] },
    { en: 'Retention Lever', rect: [75, 25, 8, 62] },
    { en: 'Socket Screws', rect: [27, 13, 8, 8] },
    { en: 'VRM', rect: [1, 18, 15, 48] },
  ],
  'ddr5-1': [
    { en: 'DIMM Connector', rect: [2, 90, 96, 7] },
    { en: 'Single Key Notch', rect: [47, 36, 4, 8] },
    { en: 'Memory Chips', rect: [4, 74, 30, 20] },
    { en: 'PMIC', rect: [44, 59, 10, 16] },
  ],
  'm2Ssd-1': [
    { en: 'M.2 Connector (M key)', rect: [90, 16, 6, 44] },
    { en: 'Single Key Notch', rect: [89, 62, 7, 9] },
    { en: 'Mounting Notch', rect: [4, 38, 7, 17] },
  ],
  'modularPsu-1': [
    { en: 'Modular Sockets', rect: [52, 45, 39, 23] },
    { en: 'Modular Cables', rect: [80, 55, 17, 23] },
  ],
  'sataSsd-1': [
    { en: 'SATA Data Connector', rect: [11, 57, 14, 14] },
    { en: 'SATA Power Connector', rect: [23, 66, 20, 18] },
  ],
  'aioCooler-1': [
    { en: 'Pump Block', rect: [36, 53, 30, 30] },
    { en: 'Tubes', rect: [65, 56, 30, 30] },
    { en: 'Radiator & Fans', rect: [7, 23, 79, 32] },
  ],
  'aioCooler-2': [
    { en: 'Pump Block', rect: [38, 26, 30, 42] },
    { en: 'Tubes', rect: [64, 40, 36, 52] },
  ],
  'frontPanel-1': [
    { en: 'Power LED Pins', rect: [43, 42, 20, 18] },
    { en: 'Power Switch Pins', rect: [65, 42, 15, 17] },
    { en: 'HDD LED Pins', rect: [55, 60, 12, 14] },
    { en: 'Reset Switch Pins', rect: [67, 60, 13, 14] },
    { en: 'Speaker Pins', rect: [31, 60, 24, 14] },
  ],
}

export const exploreEntries: ExploreEntry[] = [
  // 1. power supply
  {
    id: 'powerSupply', lesson: 1, thumb: 'powerSupply.webp', swf: 'explorePowerSupply',
    name: { ar: 'علبة التغذية', fr: "Bloc d'alimentation", en: 'Power supply' },
    what: 'علبة معدنية تحوّل كهرباء الحائط (تيار متناوب 220 فولط) إلى تيار مستمر منخفض (3.3 و5 و12 فولط) تحتاجه قطع الحاسوب.',
    role: 'تغذّي اللوحة الأم والأقراص والمراوح عبر حزمة أسلاك بموصّلات مختلفة، ومروحتها تُخرج الهواء الساخن من الصندوق.',
    today: 'ما زالت في كل حاسوب مكتبي. قدرتها تُقاس بالواط: 300 واط في هذا المثال، ومن 500 إلى 850 واط في حواسيب الألعاب اليوم.',
    fact: 'لا تفتح علبة التغذية أبدًا: مكثّفاتها قد تحتفظ بشحنة كهربائية خطيرة حتى بعد فصل الكابل.',
  },
  {
    id: 'screws', lesson: 1, thumb: 'driveScrews.webp', image: 'cardScrews.webp',
    name: { ar: 'البراغي', fr: 'Vis', en: 'Screws' },
    what: 'براغي صغيرة تثبّت القطع في صندوق الحاسوب.',
    role: 'تمنع القطع من التحرّك وتضمن تلامسها الجيد. لكل قطعة براغيها المناسبة: استعمل البرغي الصحيح، ولا تشدّه بقوة زائدة.',
    fact: 'اللوحة الأم لا تُثبَّت مباشرة على المعدن، بل فوق دعامات صغيرة (entretoises) تمنع التماس الكهربائي.',
  },
  // 2. motherboard
  {
    id: 'cpu', lesson: 2, thumb: 'cpu.webp', swf: 'exploreCPU',
    name: { ar: 'المعالج', fr: 'Processeur (CPU)', en: 'Processor (CPU)' },
    what: '«دماغ» الحاسوب: شريحة تنفّذ تعليمات البرامج والعمليات الحسابية.',
    role: 'يقرأ التعليمات من الذاكرة الحية وينفّذها بمليارات العمليات في الثانية. سرعته تُقاس بالجيغاهرتز (GHz).',
    today: 'معالجات اليوم تضمّ عدة أنوية (من 4 إلى 16 نواة وأكثر) تعمل معًا، وأغلبها يحتوي على معالج رسوميات مدمج.',
    fact: 'المثلث الصغير في زاوية المعالج (الطرف 1) يجب أن يقابل مثلث المقبس. في هذا النوع (LGA) الدبابيس الهشّة موجودة في المقبس: لا تلمسها.',
  },
  {
    id: 'thermalPaste', lesson: 2, thumb: 'thermalGlue.webp', swf: 'exploreThermalPaste',
    captions: ['أنبوب المعجون الحراري'],
    name: { ar: 'المعجون الحراري', fr: 'Pâte thermique', en: 'Thermal compound' },
    what: 'معجون رمادي يوضع بطبقة رقيقة بين المعالج والمشتت الحراري.',
    role: 'يملأ الفراغات المجهرية بين السطحين، فتنتقل الحرارة من المعالج إلى المشتت بشكل أفضل.',
    today: 'ما زال ضروريًا. بعض المشتتات تأتي بمعجون موضوع مسبقًا تحتها.',
    fact: 'كمية بحجم حبّة أرز تكفي: الزيادة لا تحسّن التبريد.',
  },
  {
    id: 'heatsink', lesson: 2, thumb: 'heatsink.webp', swf: 'exploreHeatSink',
    name: { ar: 'المشتت الحراري والمروحة', fr: 'Ventirad', en: 'Heat sink and fan' },
    what: 'قطعة معدنية بزعانف (ألمنيوم ونحاس) فوقها مروحة، تُركَّب على المعالج.',
    role: 'تمتصّ حرارة المعالج وتنشرها في الهواء، والمروحة تطرد الهواء الساخن. دون تبريد يسخن المعالج ويتوقّف الحاسوب خلال ثوانٍ.',
    today: 'بعض الحواسيب القوية تستعمل تبريدًا بالماء: سائل يدور في أنابيب نحو مشعّ بمراوح.',
    fact: 'لا تنسَ توصيل سلك المروحة بموصّل CPU_FAN في اللوحة الأم.',
  },
  {
    id: 'ram', lesson: 2, thumb: 'ram.webp', swf: 'exploreRam',
    name: { ar: 'الذاكرة الحية', fr: 'Mémoire vive (RAM)', en: 'Memory (RAM)' },
    what: 'شريحة إلكترونية تحفظ مؤقتًا البرامج والبيانات التي يعمل عليها المعالج.',
    role: 'كلما كانت أكبر استطاع الحاسوب فتح برامج أكثر في الوقت نفسه دون بطء. محتواها يُمحى عند إطفاء الحاسوب.',
    today: 'النوع في الدرس هو DDR2 (سنة 2007). اليوم DDR4 وDDR5، وسعة 8 إلى 32 جيغابايت شائعة. لكل جيل شقّ توجيه في مكان مختلف، فلا يدخل في منفذ جيل آخر.',
    fact: 'شقّ التوجيه يمنع تركيب الشريحة بالمقلوب، والمزلاجان الجانبيان يُغلقان وحدهما عند الضغط الصحيح.',
  },
  {
    id: 'motherboard', lesson: 2, thumb: 'motherboard.webp', swf: 'exploreMotherboard',
    name: { ar: 'اللوحة الأم', fr: 'Carte mère', en: 'Motherboard' },
    what: 'اللوحة الإلكترونية الكبيرة التي تُربط بها كل قطع الحاسوب.',
    role: 'تنقل البيانات والكهرباء بين المعالج والذاكرة والبطاقات والأقراص. عليها المقابس والمنافذ والموصّلات، ومنافذها الخلفية تظهر خلف الصندوق.',
    today: 'لوحات اليوم تضمّ منافذ M.2 لأقراص SSD السريعة، وUSB-C وHDMI، وغالبًا الصوت والشبكة وWi-Fi مدمجة. اختفت من أغلبها منافذ PS/2 والمنفذان المتوازي والتسلسلي.',
    fact: 'البطارية الصغيرة (CR2032) تحفظ الساعة وإعدادات BIOS عندما يكون الحاسوب مطفأ.',
  },
  // 3. expansion cards
  {
    id: 'nic', lesson: 3, thumb: 'nicCard.webp', swf: 'exploreNicCard',
    name: { ar: 'بطاقة الشبكة', fr: 'Carte réseau', en: 'Network card (NIC)' },
    what: 'بطاقة توسعة تربط الحاسوب بشبكة سلكية عبر كابل Ethernet.',
    role: 'ترسل البيانات وتستقبلها عبر منفذ RJ45، نحو شبكة المؤسسة أو الإنترنت عبر الموجّه (routeur).',
    today: 'منفذ الشبكة اليوم مدمج في اللوحة الأم، وسرعة 1 جيغابت في الثانية هي المعتادة.',
    fact: 'لكل بطاقة شبكة في العالم عنوان فريد يسمّى عنوان MAC.',
  },
  {
    id: 'wireless', lesson: 3, thumb: 'wirelessCard.webp', swf: 'exploreWirelessCard',
    name: { ar: 'بطاقة الشبكة اللاسلكية', fr: 'Carte Wi-Fi', en: 'Wireless card' },
    what: 'بطاقة توسعة تربط الحاسوب بالشبكة دون أسلاك، عبر موجات الراديو (Wi-Fi).',
    role: 'يتّصل هوائيها المثبّت خلف الصندوق بنقطة وصول أو موجّه Wi-Fi.',
    today: 'أغلب الحواسيب المحمولة واللوحات الأم الحديثة تضمّ Wi-Fi مدمجًا (Wi-Fi 6)، أسرع بكثير من هذه البطاقة (Wireless-G، 54 ميغابت في الثانية).',
    fact: 'الهوائي يُركَّب في الدرس الأخير على موصّل هذه البطاقة.',
  },
  {
    id: 'videoCard', lesson: 3, thumb: 'videoCard.webp', swf: 'exploreVideoCard',
    name: { ar: 'بطاقة الرسوميات', fr: 'Carte graphique', en: 'Video card' },
    what: 'بطاقة توسعة تُنتج الصورة التي تظهر على الشاشة.',
    role: 'معالجها الخاص (GPU) وذاكرتها (VRAM) يحسبان الصور والفيديو والألعاب ثلاثية الأبعاد، فيخفّفان العمل عن المعالج.',
    today: 'بطاقات اليوم أقوى بآلاف المرات وتُستعمل أيضًا في الذكاء الاصطناعي. منافذها HDMI وDisplayPort، وتحتاج غالبًا تغذية إضافية من علبة التغذية.',
    fact: 'تُركَّب دائمًا في أطول منفذ على اللوحة الأم: PCIe x16.',
  },
  // 4. hard drive
  {
    id: 'hdd', lesson: 4, thumb: 'hardDrive.webp', swf: 'exploreHarddrive',
    name: { ar: 'القرص الصلب', fr: 'Disque dur (HDD)', en: 'Hard drive (HDD)' },
    what: 'قرص يحفظ البيانات بشكل دائم (نظام التشغيل، البرامج، ملفاتك) حتى بعد إطفاء الحاسوب.',
    role: 'بداخله أقراص معدنية ممغنطة تدور بسرعة (7200 دورة في الدقيقة) ورأس قراءة يتحرّك فوقها. يوصل بكابل بيانات SATA وكابل تغذية.',
    today: 'عوّضه غالبًا قرص SSD: دون أجزاء متحرّكة، أسرع بعدة مرات وأكثر تحمّلًا للصدمات. أقراص M.2 تُركَّب مباشرة على اللوحة الأم دون أسلاك، لكن HDD ما زال أرخص للسعات الكبيرة.',
    fact: 'لا تحرّك الحاسوب وهو يعمل: صدمة واحدة قد تتلف قرصًا يدور.',
  },
  // 5. drives in external bays
  {
    id: 'dvd', lesson: 5, thumb: 'dvdDrive.webp', swf: 'exploreDVD',
    name: { ar: 'قارئ الأقراص الضوئية', fr: 'Lecteur/graveur DVD', en: 'Optical drive (DVD)' },
    what: 'قارئ وناسخ للأقراص الضوئية CD وDVD.',
    role: 'يقرأ البيانات بشعاع ليزر ينعكس على سطح القرص. كان يُستعمل لتثبيت البرامج وسماع الموسيقى ومشاهدة الأفلام.',
    today: 'نادر في الحواسيب الجديدة: عوّضه التحميل من الإنترنت ومفاتيح USB. قرص CD يسع 700 ميغابايت، وDVD يسع 4.7 جيغابايت.',
    fact: 'ثقب الإخراج الاضطراري يسمح بإخراج قرص عالق بدبوس، حتى والحاسوب مطفأ.',
  },
  {
    id: 'floppy', lesson: 5, thumb: 'floppyDrive.webp', swf: 'exploreFloppy',
    name: { ar: 'قارئ الأقراص المرنة', fr: 'Lecteur de disquette', en: 'Floppy drive' },
    what: 'قارئ الأقراص المرنة (disquettes): أقراص مربّعة صغيرة (3.5 بوصة) داخل غلاف بلاستيكي، كانت تُستعمل لحفظ الملفات ونقلها.',
    role: 'في الثمانينيات والتسعينيات كان الوسيلة الأساسية لنقل الملفات بين الحواسيب وتثبيت البرامج.',
    today: 'اختفى تمامًا من الحواسيب منذ حوالي 2010. القرص المرن يسع 1.44 ميغابايت فقط: مفتاح USB بسعة 32 جيغابايت يعادل أكثر من 20 ألف قرص مرن!',
    fact: 'أيقونة «حفظ» في البرامج ما زالت ترسم قرصًا مرنًا 💾',
  },
  // 6. internal cables
  {
    id: 'pata', lesson: 6, thumb: 'pata1.webp', swf: 'exploreParallelDVD',
    captions: ['الكابل كاملًا: موصّل للّوحة الأم وموصّلان للأقراص', 'الموصّل الأزرق: نحو اللوحة الأم', 'الموصّل الأسود: نحو القارئ'],
    name: { ar: 'كابل PATA', fr: 'Nappe PATA (IDE)', en: 'PATA (IDE) cable' },
    what: 'كابل بيانات عريض ومسطّح (nappe) بـ40 طرفًا، يربط الأقراص والقارئات القديمة باللوحة الأم.',
    role: 'في الدرس يربط قارئ DVD. يمكنه ربط قطعتين على الكابل نفسه (maître / esclave)، ويُحدَّد ذلك بدبابيس الوصلات (jumpers).',
    today: 'عوّضه كابل SATA الرفيع منذ حوالي 2008.',
    fact: 'الشريط الأحمر على طرف الكابل يدلّ على الطرف 1 للموصّل.',
  },
  {
    id: 'floppyCable', lesson: 6, thumb: 'pata2.webp', swf: 'exploreParallelFLOPPY',
    captions: ['الكابل كاملًا', 'الموصّل: 34 طرفًا'],
    name: { ar: 'كابل القرص المرن', fr: 'Nappe disquette', en: 'Floppy cable' },
    what: 'كابل مسطّح بـ34 طرفًا خاص بقارئ الأقراص المرنة.',
    role: 'يربط قارئ الأقراص المرنة باللوحة الأم. بعض أسلاكه ملتوية قرب طرفه ليُعرَف القارئ على أنه A:.',
    today: 'اختفى مع اختفاء القرص المرن.',
    fact: 'لهذا يحمل القرص الأول في Windows الحرف C: الحرفان A: وB: كانا محجوزين للأقراص المرنة!',
  },
  {
    id: 'sata', lesson: 6, thumb: 'sata.webp', swf: 'exploreSATA',
    captions: ['الكابل كاملًا', 'موصّل بمشبك معدني', 'موصّل على شكل حرف L'],
    name: { ar: 'كابل SATA', fr: 'Câble SATA', en: 'SATA cable' },
    what: 'كابل بيانات رفيع بـ7 أطراف يربط القرص الصلب باللوحة الأم.',
    role: 'ينقل البيانات أسرع من كابل PATA، وشكل موصّله (حرف L) يمنع تركيبه بالمقلوب.',
    today: 'ما زال يُستعمل لأقراص HDD وSSD مقاس 2.5 بوصة، لكن أقراص M.2 الحديثة لا تحتاج أي كابل.',
    fact: 'بعض الكابلات لها مشبك معدني يثبّتها: اضغط عليه قبل السحب.',
  },
  // 7. external cables
  {
    id: 'casePanels', lesson: 7, thumb: 'panels.webp', image: 'panels.webp',
    name: { ar: 'غطاء الصندوق', fr: 'Panneaux du boîtier', en: 'Case panels' },
    what: 'الأغطية الجانبية لصندوق الحاسوب (boîtier).',
    role: 'تحمي القطع من الغبار والصدمات، وتوجّه الهواء لتبريد أفضل، وتخفّف الضجيج.',
    fact: 'أعد تركيب الغطاء وتثبيته قبل تشغيل الحاسوب.',
  },
  {
    id: 'monitor', lesson: 7, thumb: 'periMonitor.webp', swf: 'explorePeriMonitor',
    captions: ['كابل الشاشة DVI'],
    name: { ar: 'كابل الشاشة', fr: 'Câble écran', en: 'Monitor cable' },
    what: 'كابل ينقل صورة الحاسوب إلى الشاشة.',
    role: 'يوصل بمنفذ بطاقة الرسوميات (أو اللوحة الأم). في الصورة كابل DVI.',
    today: 'اليوم HDMI وDisplayPort (ينقلان الصورة والصوت معًا)، وأحيانًا USB-C. كابل VGA الأزرق ما زال في كثير من أجهزة العرض (data show).',
  },
  {
    id: 'keyboard', lesson: 7, thumb: 'periKeyboard.webp', swf: 'explorePeriKeyboard',
    captions: ['لوحة المفاتيح'],
    name: { ar: 'لوحة المفاتيح', fr: 'Clavier', en: 'Keyboard' },
    what: 'جهاز إدخال لكتابة النصوص وإعطاء الأوامر.',
    role: 'في الدرس توصل بمنفذ PS/2 البنفسجي.',
    today: 'لوحات المفاتيح اليوم بمنفذ USB أو لاسلكية (Bluetooth).',
    fact: 'ترتيب AZERTY (فرنسا والجزائر) يختلف عن QWERTY (أمريكا): انظر إلى أول ستّة حروف.',
  },
  {
    id: 'mouse', lesson: 7, thumb: 'periMouse.webp', swf: 'explorePeriMouse',
    captions: ['الفأرة', 'موصّل PS/2 الأخضر'],
    name: { ar: 'الفأرة', fr: 'Souris', en: 'Mouse' },
    what: 'جهاز تأشير يحرّك المؤشّر على الشاشة.',
    role: 'في الدرس توصل بمنفذ PS/2 الأخضر: الألوان تمنع الخلط مع لوحة المفاتيح.',
    today: 'فأرة اليوم بمنفذ USB أو لاسلكية، ومستشعرها ضوئي. الفأرة القديمة كانت بكرة مطاطية تتّسخ!',
  },
  {
    id: 'usb', lesson: 7, thumb: 'periUSB.webp', swf: 'explorePeriUSB',
    captions: ['كابل USB: الطرف المسطّح (نوع A) والطرف المربّع (نوع B)'],
    name: { ar: 'كابل USB', fr: 'Câble USB', en: 'USB cable' },
    what: 'USB منفذ عالمي لربط أجهزة كثيرة بالحاسوب: الطابعة، مفتاح USB، الهاتف…',
    role: 'في الصورة كابل طابعة: الطرف المسطّح (نوع A) للحاسوب، والطرف المربّع (نوع B) للطابعة.',
    today: 'موصّل USB-C الحديث يدخل في الاتجاهين، وينقل البيانات والشحن وحتى الصورة.',
    fact: 'USB 2.0 ينقل 480 ميغابت في الثانية، وUSB4 حتى 40 جيغابت في الثانية.',
  },
  {
    id: 'ethernet', lesson: 7, thumb: 'periEthernet.webp', swf: 'explorePeriEthernet',
    captions: ['كابل الشبكة', 'موصّل RJ45'],
    name: { ar: 'كابل الشبكة', fr: 'Câble Ethernet (RJ45)', en: 'Ethernet cable' },
    what: 'كابل الشبكة بموصّلين شفّافين RJ45.',
    role: 'يربط بطاقة الشبكة بالموجّه أو بالمبدّل (switch) في شبكة المخبر أو نحو الإنترنت.',
    today: 'ما زال أكثر استقرارًا وسرعة من Wi-Fi. أنواعه الشائعة Cat5e وCat6.',
    fact: 'بداخله 8 أسلاك صغيرة ملتوية مثنى مثنى لتقليل التشويش.',
  },
  {
    id: 'antenna', lesson: 7, thumb: 'wirelessAntenna.webp', image: 'wirelessAntenna.webp',
    name: { ar: 'الهوائي اللاسلكي', fr: 'Antenne Wi-Fi', en: 'Wireless antenna' },
    what: 'هوائي يُثبَّت خلف الحاسوب على بطاقة الشبكة اللاسلكية.',
    role: 'يلتقط موجات Wi-Fi ويرسلها. وضعه عموديًا يحسّن الإشارة عادة.',
  },
  {
    id: 'powerCord', lesson: 7, thumb: 'peripheralPower.webp', swf: 'explorePeriPOWER',
    captions: ['كابل الكهرباء'],
    name: { ar: 'كابل الكهرباء', fr: "Câble d'alimentation", en: 'Power cord' },
    what: 'كابل يربط علبة التغذية بمأخذ الكهرباء في الحائط.',
    role: 'آخر كابل يوصل عند التركيب، وأول كابل يُفصل قبل فتح الحاسوب!',
    fact: 'القابس في الصورة أمريكي. في الجزائر القابس بطرفين دائريين.',
  },
]

// today's parts, by topic (todayTopics)
exploreEntries.push(
  {
    id: 'lgaCpu', era: 'modern', lesson: 1, pair: 'cpu', captions: ['من الأعلى', 'من الأسفل: نقاط التلامس'],
    name: { ar: 'المعالج الحديث (LGA)', fr: 'Processeur LGA', en: 'LGA processor' },
    what: 'المعالج هو «دماغ» الحاسوب: ينفّذ تعليمات البرامج ويحسب. المعالجات الحديثة فيها عدّة أنوية (cores) تعمل في الوقت نفسه.',
    role: 'في الصورة الثانية وجهه السفلي: مئات نقاط التلامس المسطّحة الذهبية. لا دبابيس فيه: الدبابيس في المقبس على اللوحة الأم (LGA).',
    before: 'معالجات 2007 كانت تحمل دبابيس تحتها تنثني بسهولة، ونواة أو نواتين فقط.',
    fact: 'في معالج واحد اليوم أكثر من 10 مليارات ترانزستور.',
  },
  {
    id: 'cpuSocket', era: 'modern', lesson: 1, pair: 'motherboard', captions: ['Intel ‏LGA 1700', 'AMD ‏AM5 (مفتوح)'],
    name: { ar: 'مقبس المعالج', fr: 'Socket du processeur', en: 'CPU socket' },
    what: 'المقبس هو مكان المعالج على اللوحة الأم: إطار معدني فيه أكثر من 1700 دبوس دقيق يلامس المعالج.',
    role: 'يُفتح بذراع جانبي وغطاء معدني، ثم يُغلق ليضغط المعالج على الدبابيس بالتساوي.',
    before: 'قديمًا كانت الثقوب في المقبس والدبابيس في المعالج.',
    fact: 'لكل جيل من المعالجات مقبسه: معالج AM5 لا يدخل في مقبس LGA 1700.',
  },
  {
    id: 'ddr5', era: 'modern', lesson: 2, pair: 'ram',
    name: { ar: 'ذاكرة DDR5', fr: 'Mémoire DDR5', en: 'DDR5 memory' },
    what: 'الذاكرة الحية تحفظ البرامج والمعطيات التي يعمل عليها المعالج الآن، وتُمحى عند إطفاء الحاسوب.',
    role: 'في الصورة وجها الشريحة: في الأعلى الملصق والملامس الذهبية، وفي الأسفل رقاقات الذاكرة ومنظّم الجهد PMIC، الجديد في DDR5.',
    before: 'في 2007 كانت الذاكرة DDR2 بسعة 512 ميغابايت إلى 2 جيغابايت. شريحة DDR5 واحدة اليوم فيها 16 أو 32 جيغابايت.',
    fact: 'لكل جيل (DDR3، DDR4، DDR5) فتحة في مكان مختلف: لا تدخل شريحة DDR4 في منفذ DDR5.',
  },
  {
    id: 'm2Ssd', era: 'modern', lesson: 2, pair: 'hdd',
    name: { ar: 'قرص M.2 NVMe', fr: 'SSD M.2 NVMe', en: 'M.2 NVMe SSD' },
    what: 'قرص تخزين دون أجزاء متحرّكة (SSD): يحفظ النظام والملفات في رقاقات ذاكرة «فلاش».',
    role: 'يُركَّب مباشرة في منفذ M.2 على اللوحة الأم ويُثبَّت ببرغي صغير. يتّصل عبر PCIe، لذلك هو سريع جدًا ولا يحتاج أي كابل.',
    before: 'القرص الصلب القديم أقراص مغناطيسية تدور ورأس قراءة يتحرّك: أبطأ بعشرات المرات، ويتأثّر بالصدمات.',
    fact: 'قرص NVMe حديث يقرأ أكثر من 7000 ميغابايت في الثانية، والقرص الصلب القديم حوالي 100 فقط.',
  },
  {
    id: 'towerCooler', era: 'modern', lesson: 3, pair: 'heatsink',
    name: { ar: 'المبرّد البرجي', fr: 'Ventirad tour', en: 'Tower CPU cooler' },
    what: 'مبرّد كبير للمعالج: قاعدة معدنية تلامس المعالج، أنابيب حرارية نحاسية، وبرج من الزعانف الرقيقة.',
    role: 'ينقل حرارة المعالج إلى الزعانف، والمروحة المثبّتة عليها تدفع الهواء بينها نحو خلف الصندوق.',
    before: 'مشتتات 2007 كانت صغيرة ومروحتها فوقها مباشرة، لأن المعالجات كانت تُنتج حرارة أقل.',
    fact: 'في الأنابيب الحرارية قليل من سائل يتبخّر عند المعالج ويتكثّف في الزعانف: هكذا تنتقل الحرارة بسرعة.',
  },
  {
    id: 'aioCooler', era: 'modern', lesson: 3, pair: 'heatsink', captions: ['المبرّد كاملًا (360 مم)', 'المضخّة فوق المعالج'],
    name: { ar: 'مبرّد مائي (AIO)', fr: 'Watercooling AIO', en: 'AIO liquid cooler' },
    what: 'مبرّد بالسائل «الكل في واحد» (AIO): رأس مضخّة يوضع فوق المعالج، أنبوبان، ومبرِّد (radiateur) بمراوحه، كلّها مغلقة ومملوءة مسبقًا.',
    role: 'المضخّة تدفع سائلًا يأخذ حرارة المعالج ويحملها في الأنبوبين إلى المبرِّد، حيث تطردها المراوح خارج الصندوق. يُثبَّت المبرِّد في أعلى الصندوق أو في واجهته.',
    before: 'في 2007 كان التبريد المائي نادرًا ويُركَّب قطعةً قطعة. اليوم يُباع جاهزًا ومغلقًا، ولا يحتاج أي صيانة للسائل.',
    fact: 'رأس المضخّة يوصل بالمنفذ CPU_FAN أو AIO_PUMP في اللوحة الأم: إذا لم تدُر المضخّة، يسخن المعالج في ثوانٍ.',
  },
  {
    id: 'modernBoard', era: 'modern', lesson: 4, pair: 'motherboard',
    name: { ar: 'اللوحة الأم الحديثة (ATX)', fr: 'Carte mère ATX', en: 'ATX motherboard' },
    what: 'الدارة الرئيسية التي تربط كل القطع: المعالج، الذاكرة، البطاقات، الأقراص، والمنافذ.',
    role: 'اللوحة في الصورة مُدارة: منافذها الخلفية تحت الغطاء في الأسفل على اليسار. مرّر الفأرة على الأرقام لتعرف أجزاءها.',
    before: 'لوحات 2007 كانت فيها منافذ AGP وPCI وIDE ومنفذ القرص المرن، وكلها اختفت اليوم.',
    fact: 'المقاس ATX موجود منذ 1995: لذلك تدخل لوحة حديثة في صندوق قديم بالأبعاد نفسها.',
  },
  {
    id: 'modernCase', era: 'modern', lesson: 4, pair: 'casePanels',
    name: { ar: 'الصندوق الحديث', fr: 'Boîtier ATX', en: 'ATX case' },
    what: 'علبة الحاسوب: تحمل القطع وتحميها وتنظّم تيّار الهواء.',
    role: 'الصندوق في الصورة مفتوح من جانبه: علبة التغذية تحت غطاء في الأسفل، فتحات لتمرير الكوابل خلف اللوحة، ومراوح في الأمام والخلف.',
    before: 'صناديق 2007 كانت فيها حجرات أمامية كثيرة لقارئات الأقراص، ولا مكان لإخفاء الكوابل.',
    fact: 'كثير من الصناديق اليوم لها جانب زجاجي، لذلك صار ترتيب الكوابل مهمًّا.',
  },
  {
    id: 'modularPsu', era: 'modern', lesson: 5, pair: 'powerSupply',
    name: { ar: 'علبة التغذية المعيارية', fr: "Bloc d'alimentation modulaire", en: 'Modular power supply' },
    what: 'تحوّل كهرباء المأخذ (220 فولط متناوب) إلى جهد مستمر منخفض (12 و5 و3.3 فولط) تحتاجه القطع.',
    role: 'في الصورة وجهها «المعياري»: مقابس نوصل بها فقط الكوابل التي نحتاجها.',
    before: 'علب التغذية القديمة كانت كل كوابلها ثابتة، حتى التي لا نستعملها.',
    fact: 'شعار 80 PLUS يعني أن العلبة تحوّل أكثر من 80٪ من الكهرباء دون أن تضيع حرارةً.',
  },
  {
    id: 'atx24', era: 'modern', lesson: 5, pair: 'powerSupply',
    name: { ar: 'الكابل الرئيسي 24 دبوسًا', fr: 'Câble ATX 24 broches', en: 'ATX 24-pin cable' },
    what: 'الكابل الذي يغذّي اللوحة الأم كلها.',
    role: 'يوصل بأكبر مقبس على حافة اللوحة الأم. مشبكه البلاستيكي يمنع تركيبه مقلوبًا ويُمسكه في مكانه.',
    before: 'قديمًا كان الموصّل 20 دبوسًا فقط، ثم أضيفت إليه 4 دبابيس.',
    fact: 'لكل لون جهد: الأصفر 12 فولط، الأحمر 5 فولط، البرتقالي 3.3 فولط، والأسود للأرضي.',
  },
  {
    id: 'eps8', era: 'modern', lesson: 5,
    name: { ar: 'كابل المعالج 8 دبابيس', fr: 'Câble EPS 8 broches (CPU)', en: 'EPS 8-pin CPU cable' },
    what: 'كابل خاص بتغذية المعالج.',
    role: 'يوصل بالمقبس CPU_PWR في أعلى اللوحة الأم، قرب المعالج. قد يأتي في شكل 4+4 دبابيس.',
    fact: 'يشبه كابل بطاقة الرسوميات (PCIe) لكنه لا يتوافق معه: اقرأ الكتابة عليه قبل التوصيل.',
  },
  {
    id: 'gpu', era: 'modern', lesson: 6, pair: 'videoCard', captions: ['بطاقة بمروحتين', 'بطاقة بثلاث مراوح'],
    name: { ar: 'بطاقة الرسوميات الحديثة', fr: 'Carte graphique', en: 'Graphics card (GPU)' },
    what: 'بطاقة تحسب الصور ثلاثية الأبعاد وترسلها إلى الشاشة. فيها معالج رسوميات (GPU) وذاكرة خاصة به.',
    role: 'تُركَّب في المنفذ PCIe x16 الأول وتُثبَّت بحاملها المعدني في خلف الصندوق. مراوحها تبرّد معالجها، ومنافذها (HDMI وDisplayPort) للشاشة.',
    before: 'في 2007 كانت بطاقة الرسوميات صغيرة، بمروحة واحدة أو دونها، ومنفذها VGA أو DVI.',
    fact: 'تُستعمل معالجات الرسوميات اليوم في الذكاء الاصطناعي أيضًا، لأنها تحسب آلاف العمليات في الوقت نفسه.',
  },
  {
    id: 'pcie12v', era: 'modern', lesson: 6,
    name: { ar: 'موصّل تغذية البطاقة 12V-2x6', fr: 'Connecteur 12V-2x6 (12VHPWR)', en: '12V-2x6 (12VHPWR) connector' },
    what: 'موصّل تغذية حديث لبطاقات الرسوميات القوية: 12 دبوسًا كبيرًا و4 دبابيس إشارة صغيرة.',
    role: 'يُدفع حتى آخره: موصّل غير مُدخل كاملًا قد يسخن. البطاقات الأخرى تستعمل موصّلات PCIe بـ 6 أو 8 دبابيس.',
    fact: 'ينقل حتى 600 واط، أي أكثر من حاسوب مكتبي كامل في 2007!',
  },
  {
    id: 'sataSsd', era: 'modern', lesson: 6, pair: 'sata', captions: ['القرص SSD', 'كابلات بيانات SATA'],
    name: { ar: 'قرص SSD ‏2.5 بوصة (SATA)', fr: 'SSD SATA 2,5″', en: '2.5″ SATA SSD' },
    what: 'قرص SSD بحجم قرص الحاسوب المحمول، يتّصل بواجهة SATA.',
    role: 'يحتاج كابلين: كابل البيانات SATA (الصغير) نحو اللوحة الأم، وكابل التغذية SATA (العريض) نحو علبة التغذية.',
    before: 'عوّض الأقراص الصلبة، وقبلها كابلات PATA العريضة.',
    fact: 'أسرع من القرص الصلب بخمس مرات تقريبًا، لكنه أبطأ من قرص M.2 NVMe.',
  },
  {
    id: 'frontPanel', era: 'modern', lesson: 7,
    name: { ar: 'منفذ الواجهة الأمامية', fr: 'Connecteur façade (F_PANEL)', en: 'Front panel header' },
    what: 'مجموعة دبابيس صغيرة على اللوحة الأم توصل بها أزرار الصندوق وأضواؤه.',
    role: 'فوق كل زوج من الدبابيس كتابة: POW LED لضوء التشغيل، ON/OFF لزر التشغيل، HLED لضوء القرص، RST لزر إعادة التشغيل.',
    fact: 'الأسماء تختلف قليلًا من لوحة إلى أخرى (PWR_SW، PLED…): دليل اللوحة الأم هو المرجع.',
  },
  {
    id: 'caseFan', era: 'modern', lesson: 7,
    name: { ar: 'مروحة الصندوق 120 مم', fr: 'Ventilateur de boîtier 120 mm', en: '120 mm case fan' },
    what: 'مروحة تدفع الهواء داخل الصندوق أو خارجه.',
    role: 'في الأمام تُدخل الهواء البارد، وفي الخلف والأعلى تُخرج الهواء الساخن. توصل بمنافذ CHA_FAN أو SYS_FAN على اللوحة الأم.',
    fact: 'على جانب المروحة سهمان صغيران: الأول يبيّن اتجاه الهواء، والثاني اتجاه الدوران.',
  },
  {
    id: 'hdmi', era: 'modern', lesson: 8, pair: 'monitor',
    name: { ar: 'كابل HDMI', fr: 'HDMI', en: 'HDMI' },
    what: 'كابل رقمي يحمل الصورة والصوت معًا نحو الشاشة أو التلفاز.',
    role: 'يوصل بمنفذ HDMI في بطاقة الرسوميات. طرفاه متشابهان، وكل طرف يدخل في اتجاه واحد فقط.',
    before: 'منفذ VGA الأزرق القديم كان يحمل الصورة فقط، بإشارة تناظرية أقل وضوحًا.',
    fact: 'HDMI 2.1 يستطيع نقل صورة بدقّة 8K.',
  },
  {
    id: 'displayport', era: 'modern', lesson: 8, pair: 'monitor',
    name: { ar: 'كابل DisplayPort', fr: 'DisplayPort', en: 'DisplayPort' },
    what: 'منفذ رقمي للشاشة، شائع في بطاقات الرسوميات وشاشات الحاسوب.',
    role: 'لطرفه زاوية مقطوعة تمنع إدخاله مقلوبًا، ومشبك يُمسكه: اضغط على زرّه قبل نزعه.',
    fact: 'في أغلب بطاقات الرسوميات 3 منافذ DisplayPort ومنفذ HDMI واحد.',
  },
  {
    id: 'usbC', era: 'modern', lesson: 8, pair: 'usb',
    name: { ar: 'منفذ USB-C', fr: 'USB-C', en: 'USB-C' },
    what: 'منفذ USB الحديث: صغير ويدخل في الاتجاهين.',
    role: 'يحمل البيانات والكهرباء، وأحيانًا الصورة، عبر كابل واحد. نجده في الهواتف والحواسيب المحمولة وخلف الحواسيب المكتبية الحديثة.',
    before: 'في 2007 كان USB 2.0 بالموصّل المستطيل A الذي لا يدخل إلا في اتجاه واحد.',
    fact: 'منذ 2024 صار USB-C إجباريًا لشحن الهواتف الجديدة في الاتحاد الأوروبي.',
  },
  {
    id: 'usbDrive', era: 'modern', lesson: 8, pair: 'floppy',
    name: { ar: 'مفتاح USB', fr: 'Clé USB', en: 'USB flash drive' },
    what: 'ذاكرة «فلاش» صغيرة نحملها في الجيب لنقل الملفات.',
    role: 'يحمل ملفات التثبيت: يُقلع منه الحاسوب الجديد لتثبيت نظام التشغيل.',
    before: 'عوّض القرص المرن (1.44 ميغابايت) والأقراص الضوئية.',
    fact: 'مفتاح 32 جيغابايت يسع ما يعادل أكثر من 22000 قرص مرن!',
  },
  {
    id: 'uefi', era: 'modern', lesson: 9, art: 'uefi.webp',
    name: { ar: 'إعدادات UEFI', fr: 'UEFI (ex-BIOS)', en: 'UEFI (formerly BIOS)' },
    what: 'برنامج صغير مخزَّن في اللوحة الأم، يعمل قبل نظام التشغيل: يفحص القطع ثم يبحث عن نظام يُقلع منه.',
    role: 'ندخل إليه بالمفتاح Del أو F2 عند التشغيل، لنرى القطع ونضبط الإعدادات: سرعة الذاكرة (XMP/EXPO)، ترتيب الإقلاع، الساعة…',
    before: 'عوّض BIOS القديم ذا الشاشة الزرقاء التي لا تُستعمل فيها الفأرة.',
    fact: 'شكل UEFI يختلف من صانع لوحة إلى آخر، لكننا نجد فيه دائمًا الإعدادات نفسها تقريبًا.',
  },
)

// classic parts point to what replaced them
for (const [classic, modern] of Object.entries({
  cpu: 'lgaCpu', ram: 'ddr5', hdd: 'm2Ssd', heatsink: 'towerCooler', motherboard: 'modernBoard', casePanels: 'modernCase',
  powerSupply: 'modularPsu', videoCard: 'gpu', sata: 'sataSsd', floppy: 'usbDrive', dvd: 'usbDrive', pata: 'm2Ssd',
  monitor: 'hdmi', usb: 'usbC', keyboard: 'usbC', mouse: 'usbC',
})) {
  const e = exploreEntries.find((x) => x.id === classic)!
  e.pair = modern
}

export const eraOf = (e: ExploreEntry): Era => e.era ?? 'classic'

/** The views of an entry: its original EXPLORE views, or its Commons photos. */
export function viewsOf(e: ExploreEntry): ExploreView[] {
  if (e.swf) return exploreViews[e.swf] ?? []
  return Object.entries(explorePhotos)
    .filter(([file]) => file.startsWith(`${e.id}-`))
    .map(([file, [w, h]], n) => ({ view: `Photo${n + 1}`, img: `modern/${file}`, w, h, callouts: photoCallouts[file.replace('.webp', '')] ?? [] }))
}

/** Card image of an entry (under public/). */
export function entryThumb(e: ExploreEntry): string {
  if (e.art) return `media/explore/modern/${e.art}`
  if (eraOf(e) === 'modern') return `media/explore/${viewsOf(e)[0]?.img}`
  return `media/thumbs/${e.thumb}`
}

export const exploreById: Record<string, ExploreEntry> = Object.fromEntries(exploreEntries.map((e) => [e.id, e]))

/** Tray part -> its explore entry (both RAM sticks share one, every screw part uses "screws"). */
export function exploreFor(part: string): ExploreEntry | undefined {
  if (part.endsWith('Screws')) return exploreById.screws
  const map: Record<string, string> = {
    iPowerSupply: 'powerSupply', iCPU: 'cpu', iThermalGlue: 'thermalPaste', iHeatsink: 'heatsink',
    iRAM1: 'ram', iRAM2: 'ram', iMobo: 'motherboard', iNic: 'nic', iWireless: 'wireless', iVideoCard: 'videoCard',
    iHD: 'hdd', iDvdDrive: 'dvd', iFloppyDrive: 'floppy', iPata1: 'pata', iPata2: 'floppyCable', iSata: 'sata',
    iCasePanels: 'casePanels', iMonitor: 'monitor', iKeyboard: 'keyboard', iMouse: 'mouse', iUSB: 'usb',
    iEthernet: 'ethernet', iAntenna: 'antenna', iPowerCord: 'powerCord',
  }
  return exploreById[map[part]]
}
