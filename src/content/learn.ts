// "Learn" text shown under the current lesson in the menu, like the original
// LEARN accordion. Based on the original English (legacy/essentials.xml) and
// the earlier Arabic translation (legacy/essentials.ar.xml), rewritten cleanly.

export interface LearnItem {
  ar: string
  /** Term as used in class (French), shown next to the Arabic. */
  fr?: string
  note?: string
}

export interface Learn {
  /** Paragraphs introducing the lesson. */
  intro: string[]
  /** Heading for the list below, if any. */
  listTitle?: string
  items?: LearnItem[]
}

export const learn: Record<number, Learn> = {
  1: {
    intro: [
      'توفّر علبة التغذية الجهد الكهربائي اللازم لتشغيل مختلف الدوائر الإلكترونية التي يتكوّن منها الحاسوب.',
      'في هذا الدرس: ثبّت علبة التغذية داخل الصندوق.',
    ],
  },
  2: {
    intro: ['اللوحة الأم هي الدارة المطبوعة الرئيسية التي تربط كل مكوّنات الحاسوب ببعضها.'],
    listTitle: 'ستركّب في هذا الدرس:',
    items: [
      { ar: 'المعالج', fr: 'Processeur' },
      { ar: 'المعجون الحراري', fr: 'Pâte thermique' },
      { ar: 'المشتت الحراري والمروحة', fr: 'Ventirad' },
      { ar: 'شريحتا ذاكرة حية', fr: 'Barrettes RAM' },
      { ar: 'اللوحة الأم في الصندوق', fr: 'Carte mère' },
    ],
  },
  3: {
    intro: ['تُركَّب بطاقات التوسعة على اللوحة الأم لإضافة وظائف جديدة إلى الحاسوب.'],
    items: [
      { ar: 'بطاقة الشبكة', fr: 'Carte réseau', note: 'تربط الحاسوب بشبكة سلكية.' },
      { ar: 'بطاقة الشبكة اللاسلكية', fr: 'Carte Wi-Fi', note: 'تربط الحاسوب بحاسوب آخر أو بنقطة وصول عبر موجات الراديو.' },
      { ar: 'بطاقة الرسوميات', fr: 'Carte graphique', note: 'ترسل الصورة إلى الشاشة.' },
    ],
  },
  4: {
    intro: [
      'القرص الصلب وحدة تخزين مغناطيسية تحفظ كمية كبيرة من المعطيات بشكل دائم.',
      'في هذا الدرس: ثبّت القرص الصلب في حجرته داخل الصندوق.',
    ],
  },
  5: {
    intro: ['تُركَّب قارئات الأقراص في الحجرات الأمامية للصندوق حتى يمكن إدخال الأقراص من الخارج.'],
    items: [
      { ar: 'قارئ الأقراص الضوئية', fr: 'Lecteur CD/DVD', note: 'يقرأ الأقراص المضغوطة ويكتب عليها، ويقرأ أقراص DVD.' },
      { ar: 'قارئ الأقراص المرنة', fr: 'Lecteur de disquette', note: 'يقرأ المعلومات من الأقراص المرنة ويكتبها عليها.' },
    ],
  },
  6: {
    intro: [
      'وصّل كل الأسلاك الداخلية بالمكوّنات المناسبة.',
      'عند توصيل كابلات البيانات، تأكّد من مطابقة الدبوس 1 في الكابل مع الدبوس 1 في المنفذ.',
    ],
    listTitle: 'الأسلاك التي ستوصّلها:',
    items: [
      { ar: 'تغذية اللوحة الأم', fr: 'ATX 20 broches' },
      { ar: 'تغذية المعالج', fr: 'ATX 4 broches' },
      { ar: 'تغذية القرص الصلب', fr: 'SATA' },
      { ar: 'تغذية قارئ الأقراص الضوئية', fr: 'Molex' },
      { ar: 'تغذية قارئ الأقراص المرنة', fr: 'Berg' },
      { ar: 'تغذية مروحة الصندوق', fr: 'Ventilateur' },
      { ar: 'كابل بيانات SATA', fr: 'Câble SATA' },
      { ar: 'كابل بيانات PATA', fr: 'Nappe IDE' },
      { ar: 'كابل القرص المرن', fr: 'Nappe disquette' },
    ],
  },
  7: {
    intro: [
      'لإنهاء التجميع، أغلق الصندوق بالغطاء وثبّته بالبراغي.',
      'بعد ذلك وصّل الأسلاك الخارجية بالمنافذ الخلفية للحاسوب.',
    ],
    listTitle: 'الأسلاك الخارجية:',
    items: [
      { ar: 'الشاشة', fr: 'Écran (VGA)' },
      { ar: 'لوحة المفاتيح', fr: 'Clavier' },
      { ar: 'الفأرة', fr: 'Souris' },
      { ar: 'USB', fr: 'USB' },
      { ar: 'الشبكة', fr: 'Ethernet' },
      { ar: 'الهوائي اللاسلكي', fr: 'Antenne Wi-Fi' },
      { ar: 'الكهرباء — في الأخير دائمًا', fr: 'Alimentation' },
    ],
  },
}
