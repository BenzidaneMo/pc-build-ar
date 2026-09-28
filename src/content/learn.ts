// Lesson texts shown around the stage: the goal line under the title, the
// "important" tip, and the "learn" card (like the original LEARN accordion).
// Based on the original English (legacy/essentials.xml) and the earlier Arabic
// translation (legacy/essentials.ar.xml), rewritten cleanly. To be reviewed by a teacher.

export interface LearnItem {
  ar: string
  /** Term as used in class (French), shown next to the Arabic. */
  fr?: string
  en?: string
  note?: string
}

export interface Learn {
  /** One line under the lesson title: what this lesson is about. */
  goal: string
  /** Paragraphs introducing the lesson. */
  intro: string[]
  /** Heading for the list below, if any. */
  listTitle?: string
  items?: LearnItem[]
  /** A safety or good-practice tip ("معلومة مهمة"). */
  tip: string
}

/** Rules that apply to every lesson ("تذكّر دائمًا"). */
export const remember = [
  'أطفئ الحاسوب وافصل الكهرباء قبل فتح الصندوق.',
  'تأكّد من اتجاه القطعة قبل تركيبها.',
  'لا تستعمل القوة أبدًا.',
  'تحقّق من كل التوصيلات قبل التشغيل.',
]

export const learn: Record<number, Learn> = {
  1: {
    goal: 'في هذا الدرس سنتعلّم كيف نثبّت علبة التغذية داخل صندوق الحاسوب.',
    intro: ['توفّر علبة التغذية الجهد الكهربائي اللازم لتشغيل مختلف الدوائر الإلكترونية التي يتكوّن منها الحاسوب.'],
    items: [
      { ar: 'علبة التغذية', fr: "Bloc d'alimentation", en: 'Power supply' },
      { ar: 'براغي علبة التغذية', fr: 'Vis', en: 'Screws' },
    ],
    tip: 'قبل فتح الصندوق: أطفئ الحاسوب وافصل سلك الكهرباء، ثم المس جزءًا معدنيًا من الصندوق لتفريغ الكهرباء الساكنة.',
  },
  2: {
    goal: 'في هذا الدرس سنركّب المعالج والذاكرة والمشتت الحراري على اللوحة الأم، ثم نثبّتها في الصندوق.',
    intro: ['اللوحة الأم هي الدارة المطبوعة الرئيسية التي تربط كل مكوّنات الحاسوب ببعضها.'],
    listTitle: 'ستركّب في هذا الدرس:',
    items: [
      { ar: 'المعالج', fr: 'Processeur', en: 'CPU' },
      { ar: 'المعجون الحراري', fr: 'Pâte thermique', en: 'Thermal paste' },
      { ar: 'المشتت الحراري والمروحة', fr: 'Ventirad', en: 'Heat sink and fan' },
      { ar: 'شريحتا ذاكرة حية', fr: 'Barrettes RAM', en: 'RAM modules' },
      { ar: 'اللوحة الأم في الصندوق', fr: 'Carte mère', en: 'Motherboard' },
    ],
    tip: 'أمسك المعالج وشرائح الذاكرة من حوافها، ولا تلمس الدبابيس ولا الملامس الذهبية.',
  },
  3: {
    goal: 'في هذا الدرس سنركّب بطاقات التوسعة في منافذها على اللوحة الأم.',
    intro: ['تُركَّب بطاقات التوسعة على اللوحة الأم لإضافة وظائف جديدة إلى الحاسوب.'],
    items: [
      { ar: 'بطاقة الشبكة', fr: 'Carte réseau', en: 'Network card', note: 'تربط الحاسوب بشبكة سلكية.' },
      { ar: 'بطاقة الشبكة اللاسلكية', fr: 'Carte Wi-Fi', en: 'Wireless card', note: 'تربط الحاسوب بحاسوب آخر أو بنقطة وصول عبر موجات الراديو.' },
      { ar: 'بطاقة الرسوميات', fr: 'Carte graphique', en: 'Video card', note: 'ترسل الصورة إلى الشاشة.' },
    ],
    tip: 'أمسك البطاقة من حوافها، واضغط عليها بلطف وبشكل مستقيم حتى تدخل كاملةً في المنفذ.',
  },
  4: {
    goal: 'في هذا الدرس سنثبّت القرص الصلب في حجرته داخل الصندوق.',
    intro: ['القرص الصلب وحدة تخزين مغناطيسية تحفظ كمية كبيرة من المعطيات بشكل دائم.'],
    items: [
      { ar: 'القرص الصلب', fr: 'Disque dur', en: 'Hard drive' },
      { ar: 'براغي القرص الصلب', fr: 'Vis', en: 'Screws' },
    ],
    tip: 'القرص الصلب حسّاس للصدمات: لا تُسقطه، ولا تحرّك الحاسوب وهو يعمل.',
  },
  5: {
    goal: 'في هذا الدرس سنركّب قارئ الأقراص الضوئية وقارئ الأقراص المرنة في الحجرات الأمامية.',
    intro: ['تُركَّب قارئات الأقراص في الحجرات الأمامية للصندوق حتى يمكن إدخال الأقراص من الخارج.'],
    items: [
      { ar: 'قارئ الأقراص الضوئية', fr: 'Lecteur CD/DVD', en: 'Optical drive', note: 'يقرأ الأقراص المضغوطة ويكتب عليها، ويقرأ أقراص DVD.' },
      { ar: 'قارئ الأقراص المرنة', fr: 'Lecteur de disquette', en: 'Floppy drive', note: 'يقرأ المعلومات من الأقراص المرنة ويكتبها عليها.' },
    ],
    tip: 'تدخل القارئات من واجهة الصندوق بعد نزع الغطاء البلاستيكي للحجرة، وواجهتها نحو الخارج.',
  },
  6: {
    goal: 'في هذا الدرس سنوصّل أسلاك التغذية وكابلات البيانات داخل الصندوق.',
    intro: [
      'وصّل كل الأسلاك الداخلية بالمكوّنات المناسبة.',
      'عند توصيل كابلات البيانات، تأكّد من مطابقة الدبوس 1 في الكابل مع الدبوس 1 في المنفذ.',
    ],
    listTitle: 'الأسلاك التي ستوصّلها:',
    items: [
      { ar: 'تغذية اللوحة الأم', fr: 'ATX 20 broches', en: 'ATX 20-pin' },
      { ar: 'تغذية المعالج', fr: 'ATX 4 broches', en: 'ATX 4-pin' },
      { ar: 'تغذية القرص الصلب', fr: 'SATA', en: 'SATA power' },
      { ar: 'تغذية قارئ الأقراص الضوئية', fr: 'Molex', en: 'Molex' },
      { ar: 'تغذية قارئ الأقراص المرنة', fr: 'Berg', en: 'Berg' },
      { ar: 'تغذية مروحة الصندوق', fr: 'Ventilateur', en: 'Case fan' },
      { ar: 'كابل بيانات SATA', fr: 'Câble SATA', en: 'SATA cable' },
      { ar: 'كابل بيانات PATA', fr: 'Nappe IDE', en: 'PATA (IDE) cable' },
      { ar: 'كابل القرص المرن', fr: 'Nappe disquette', en: 'Floppy cable' },
    ],
    tip: 'كل موصّل مصمَّم ليدخل في اتجاه واحد فقط. إذا لم يدخل بسهولة فلا تضغط بقوة: غيّر اتجاهه.',
  },
  7: {
    goal: 'في هذا الدرس سنغلق الصندوق ونوصّل الأسلاك الخارجية للحاسوب بالشكل الصحيح.',
    intro: [
      'لإنهاء التجميع، أغلق الصندوق بالغطاء وثبّته بالبراغي.',
      'بعد ذلك وصّل الأسلاك الخارجية بالمنافذ الخلفية للحاسوب.',
    ],
    listTitle: 'الأسلاك الخارجية:',
    items: [
      { ar: 'الشاشة', fr: 'Écran (VGA)', en: 'Monitor (VGA)' },
      { ar: 'لوحة المفاتيح', fr: 'Clavier', en: 'Keyboard' },
      { ar: 'الفأرة', fr: 'Souris', en: 'Mouse' },
      { ar: 'USB', fr: 'USB', en: 'USB' },
      { ar: 'الشبكة', fr: 'Ethernet', en: 'Ethernet' },
      { ar: 'الهوائي اللاسلكي', fr: 'Antenne Wi-Fi', en: 'Wi-Fi antenna' },
      { ar: 'الكهرباء — في الأخير دائمًا', fr: 'Alimentation', en: 'Power cord' },
    ],
    tip: 'وصّل سلك الكهرباء في الأخير دائمًا، بعد التأكّد من كل التوصيلات الأخرى.',
  },
}
