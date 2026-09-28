// «اكتشف القطع»: what each component is, what it does, and what it looks like today.
// Photos and callouts come from the original EXPLORE views (tools/extract_explore.py ->
// explore.json + public/media/explore/). Texts written for students; to be reviewed by a teacher.
import views from './explore.json'

export interface ExploreFeature { ar: string; fr: string }

export interface ExploreEntry {
  id: string
  lesson: number
  name: { ar: string; fr: string; en: string }
  /** Card image in media/thumbs/ (also the photo when there are no explore views). */
  thumb: string
  /** Key in explore.json (the legacy explore<Part>.swf). */
  swf?: string
  /** Without explore views: the part's image in media/images/. */
  image?: string
  /** Captions for views without a name (cables and peripherals: Photo1, Photo2…). */
  captions?: string[]
  what: string
  role: string
  /** How it looks in today's computers. */
  today?: string
  fact?: string
}

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
