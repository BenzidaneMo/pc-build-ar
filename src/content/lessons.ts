// Lesson programs, transcribed from the decompiled lesson SWF scripts
// (tools/.cache/scripts/<Lesson>/). Frames are 0-based: Flash's 1-based
// `_currentframe > 68 && _currentframe < 73` becomes [68, 71].
import type { LessonProgram, Step } from '../lib/types'

/** "الدرس الأول"... for the lesson badge. */
export const lessonOrdinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع']

export const lessonTitles = [
  'علبة التغذية',
  'اللوحة الأم',
  'البطاقات الداخلية',
  'القرص الصلب',
  'قارئات الأقراص',
  'الأسلاك الداخلية',
  'الأسلاك الخارجية',
]

const ROTATE = (what: string) =>
  `دوّر ${what} بالزرّين ↻ و↺ حتى يتطابق مع مكانه، ثم اضغط «تثبيت».`

/** Plugs shown on the rear view once connected (sub-clips of defaultView). */
const PLUGS = ['antenna', 'ethernet', 'keyboard', 'mouse', 'power', 'monitor', 'usb']

/** Drop animation of a part: plays its clip backwards from "waiting" to "installed". */
const assemble = (clip: string, to: number | string = 0): Step => ({ op: 'play', clip, to })

export const lessons: Record<number, LessonProgram> = {
  1: {
    file: 'PowerSupply',
    title: 'علبة التغذية',
    intro: [
      { op: 'hide', clips: ['iPowerSupplyScrews'] },
      { op: 'scene', frame: 'lInit' },
      { op: 'play', clip: 'mcIntro', from: 'lAssemble', to: 41 },
      { op: 'scene', frame: 7 },
    ],
    home: 7,
    tasks: [
      {
        id: 'psu',
        part: 'iPowerSupply',
        say: 'اسحب علبة التغذية من قائمة القطع وضعها في المنطقة المضيئة.',
        steps: [
          assemble('iPowerSupply', 80),
          { op: 'rotate', clip: 'iPowerSupply', range: [49, 79], correct: [[68, 71]], install: 48,
            say: 'دوّر علبة التغذية بالزرّين ↻ و↺ حتى تتطابق مع فتحتها في الصندوق، ثم اضغط «تثبيت».' },
          assemble('iPowerSupply'),
          { op: 'show', clips: ['iPowerSupplyScrews'] },
          { op: 'done', part: 'iPowerSupply' },
        ],
      },
      {
        id: 'psuScrews',
        part: 'iPowerSupplyScrews',
        after: ['psu'],
        say: 'الآن ثبّت علبة التغذية في مكانها: اسحب البراغي إلى المنطقة المضيئة.',
        steps: [assemble('iPowerSupplyScrews'), { op: 'done', part: 'iPowerSupplyScrews' }],
      },
    ],
    done: 'أحسنت! ثبّتَّ علبة التغذية بنجاح. انتقل إلى الدرس التالي: اللوحة الأم.',
  },

  2: {
    file: 'Motherboard',
    title: 'اللوحة الأم',
    intro: [
      { op: 'hide', clips: ['iMoboScrews', 'iHeatsink', 'iThermalGlue', 'iHeatsink.plugged'] },
      { op: 'scene', frame: 'lIntro' },
      { op: 'play', clip: '@root', to: 20 },
    ],
    home: 20,
    idle: 'ابدأ بتركيب المعالج أو الذاكرة الحية على اللوحة الأم.',
    tasks: [
      {
        id: 'cpu',
        part: 'iCPU',
        say: 'اسحب المعالج من قائمة القطع وضعه في المنطقة المضيئة.',
        steps: [
          assemble('iCPU', 54),
          { op: 'goto', clip: 'iCPU', frame: 0 },
          { op: 'view', clips: ['s940'] },
          { op: 'play', clip: 's940', from: 0, to: 14 },
          { op: 'rotate', clip: 's940', range: ['lStartRotation', 'lEndRotation'], correct: [[1, 3], [31, 34]], install: 'lInstall',
            say: 'دوّر المعالج حتى يتطابق المثلث الذهبي في زاويته مع علامة المقبس، ثم اضغط «تثبيت».' },
          { op: 'play', clip: 's940', to: 68 },
          { op: 'click', clip: 's940', targets: ['btn807'], say: 'اضغط على المنطقة المضيئة لإنزال غطاء المقبس على المعالج.' },
          { op: 'play', clip: 's940', to: 106 },
          { op: 'click', clip: 's940', targets: ['btn889'], say: 'اضغط على المنطقة المضيئة لإنزال الذراع وقفل المعالج في مكانه.' },
          { op: 'play', clip: 's940', to: 130 },
          { op: 'view', clips: null },
          { op: 'show', clips: ['iThermalGlue'] },
          { op: 'done', part: 'iCPU' },
        ],
      },
      {
        id: 'ram1',
        part: 'iRAM1',
        say: 'اسحب الذاكرة الحية 1 من قائمة القطع وضعها في المنطقة المضيئة.',
        steps: [
          assemble('iRAM1', 41),
          { op: 'view', clips: ['s1070'] },
          { op: 'play', clip: 's1070', from: 0, to: 22 },
          { op: 'rotate', clip: 's1070', range: ['lStartRotation', 'lEndRotation'], correct: [[5, 9]], install: 'lInstall',
            say: 'دوّر شريحة الذاكرة حتى تتطابق الفتحة في أسفلها مع البروز في المنفذ، ثم اضغط «تثبيت».' },
          { op: 'play', clip: 's1070', to: 36 },
          { op: 'click', clip: 's1070', targets: ['leftBtnRam', 'rightBtnRam'], all: true,
            say: 'اضغط على المشبكين المضيئين لتثبيت شريحة الذاكرة.' },
          { op: 'play', clip: 's1070', to: 69 },
          { op: 'view', clips: null },
          assemble('iRAM1'),
          { op: 'done', part: 'iRAM1' },
        ],
      },
      {
        id: 'ram2',
        part: 'iRAM2',
        say: 'اسحب الذاكرة الحية 2 من قائمة القطع وضعها في المنطقة المضيئة.',
        steps: [
          assemble('iRAM2', 32),
          { op: 'view', clips: ['s1868'] },
          { op: 'play', clip: 's1868', from: 0, to: 30 },
          { op: 'rotate', clip: 's1868', range: ['lStartRotation2', 'lEndRotation2'], correct: [[23, 25]], install: 'lInstall2',
            say: 'دوّر شريحة الذاكرة حتى تتطابق الفتحة في أسفلها مع البروز في المنفذ، ثم اضغط «تثبيت».' },
          { op: 'play', clip: 's1868', to: 47 },
          { op: 'click', clip: 's1868', targets: ['leftBtnRam', 'rightBtnRam'], all: true,
            say: 'اضغط على المشبكين المضيئين لتثبيت شريحة الذاكرة.' },
          { op: 'play', clip: 's1868', to: 71 },
          { op: 'view', clips: null },
          assemble('iRAM2'),
          { op: 'done', part: 'iRAM2' },
        ],
      },
      {
        id: 'paste',
        part: 'iThermalGlue',
        after: ['cpu'],
        say: 'اسحب المعجون الحراري ووزّعه على سطح المعالج (المنطقة المضيئة).',
        steps: [
          assemble('iThermalGlue'),
          { op: 'show', clips: ['iHeatsink'] },
          { op: 'done', part: 'iThermalGlue' },
        ],
      },
      {
        id: 'heatsink',
        part: 'iHeatsink',
        after: ['paste'],
        say: 'اسحب المشتت الحراري وضعه فوق المعالج في المنطقة المضيئة.',
        steps: [
          assemble('iHeatsink', 30),
          { op: 'click', clip: 'iHeatsink', targets: ['btnHotSpot'], say: 'اضغط على المنطقة المضيئة لتثبيت المشتت الحراري فوق المعالج.' },
          assemble('iHeatsink'),
          { op: 'click', clip: 'iHeatsink', targets: ['btnPower'], say: 'اضغط على المنطقة المضيئة لتوصيل سلك مروحة المشتت باللوحة الأم.' },
          { op: 'view', clips: ['mcFanInstall'] },
          { op: 'play', clip: 'mcFanInstall', from: 0, to: 39 },
          { op: 'rotate', clip: 'mcFanInstall', range: ['lStartRotation', 'lEndRotation'], correct: [[24, 30], [57, 59]], install: 'lInstall',
            say: ROTATE('موصّل المروحة') },
          { op: 'play', clip: 'mcFanInstall', to: 107 },
          { op: 'view', clips: null },
          { op: 'hide', clips: ['iHeatsink.unplugged'] },
          { op: 'show', clips: ['iHeatsink.plugged'] },
          { op: 'done', part: 'iHeatsink' },
        ],
      },
      {
        id: 'mobo',
        after: ['cpu', 'ram1', 'ram2', 'paste', 'heatsink'],
        say: '',
        label: 'تركيب اللوحة الأم في الصندوق',
        steps: [
          { op: 'button', label: 'تركيب اللوحة الأم في الصندوق', say: 'كل القطع على اللوحة الأم. اضغط «تركيب اللوحة الأم في الصندوق».' },
          { op: 'view', clips: ['s1744'] },
          { op: 'play', clip: 's1744', from: 0, to: 122 },
          { op: 'rotate', clip: 's1744', range: ['lStartRotation', 'lEndRotation'], correct: [[128, 133]], install: 'lInstall',
            say: 'دوّر اللوحة الأم حتى تتطابق منافذها الخلفية مع فتحة الصندوق، ثم اضغط «تثبيت».' },
          { op: 'play', clip: 's1744', to: 235 },
          { op: 'view', clips: ['s1744', 'iMoboScrews'] },
          { op: 'show', clips: ['iMoboScrews'] },
        ],
      },
      {
        id: 'moboScrews',
        part: 'iMoboScrews',
        after: ['mobo'],
        say: 'اسحب براغي اللوحة الأم إلى المنطقة المضيئة لتثبيتها في الصندوق.',
        steps: [assemble('iMoboScrews'), { op: 'done', part: 'iMoboScrews' }],
      },
    ],
    done: 'ممتاز! ركّبت المعالج والذاكرة والمشتت الحراري، وثبّتّ اللوحة الأم في الصندوق.',
  },

  3: {
    file: 'ExpansionCards',
    title: 'البطاقات الداخلية',
    intro: [{ op: 'scene', frame: 'lStep1' }],
    home: 'lStep1',
    idle: 'ركّب البطاقات في منافذها على اللوحة الأم، ثم ثبّت كل بطاقة ببرغيها.',
    tasks: [
      card('video', 'iVideoCard', 'iVideoScrews', 'بطاقة الرسوميات', 'PCIe x16'),
      card('nic', 'iNic', 'iNicScrews', 'بطاقة الشبكة', 'PCIe x1'),
      card('wifi', 'iWireless', 'iWirelessScrews', 'بطاقة الشبكة اللاسلكية', 'PCI'),
    ].flat(),
    done: 'أحسنت! ركّبت بطاقة الرسوميات وبطاقتَي الشبكة وثبّتّها بالبراغي.',
  },

  4: {
    file: 'InternalDrive',
    title: 'القرص الصلب',
    intro: [{ op: 'hide', clips: ['iHDScrews'] }, { op: 'scene', frame: 'lStep1' }],
    home: 'lStep1',
    tasks: [
      {
        id: 'hd',
        part: 'iHD',
        say: 'اسحب القرص الصلب من قائمة القطع وضعه أمام حجرة الأقراص 3.5 بوصة (المنطقة المضيئة).',
        steps: [
          assemble('iHD', 109),
          { op: 'rotate', clip: 'iHD', range: ['lStartRotation', 'lEndRotation'], correct: [[98, 108]], install: 'lInstall',
            say: 'دوّر القرص الصلب حتى تكون منافذه نحو داخل الصندوق، ثم اضغط «تثبيت».' },
          assemble('iHD'),
          { op: 'show', clips: ['iHDScrews'] },
          { op: 'done', part: 'iHD' },
        ],
      },
      {
        id: 'hdScrews',
        part: 'iHDScrews',
        after: ['hd'],
        say: 'اسحب براغي القرص الصلب إلى المنطقة المضيئة لتثبيته في الحجرة.',
        steps: [
          assemble('iHDScrews', 1),
          { op: 'scene', frame: 'lView1' },
          { op: 'play', clip: 's362', from: 0, to: 72 },
          { op: 'scene', frame: 'lStep1' },
          assemble('iHDScrews'),
          { op: 'done', part: 'iHDScrews' },
        ],
      },
    ],
    done: 'أحسنت! القرص الصلب مثبّت في حجرته.',
  },

  5: {
    file: 'ExternalDrives',
    title: 'قارئات الأقراص',
    intro: [
      { op: 'hide', clips: ['mcDVDScrews', 'mcFloppyScrews', 'iDvdScrews', 'iFloppyScrews'] },
      { op: 'scene', frame: 'lStep1' },
    ],
    home: 'lStep1',
    idle: 'ركّب قارئ الأقراص الضوئية في حجرة 5.25 بوصة، وقارئ الأقراص المرنة في حجرة 3.5 بوصة.',
    tasks: [
      {
        id: 'dvd',
        part: 'iDvdDrive',
        say: 'اسحب قارئ الأقراص الضوئية إلى حجرة 5.25 بوصة (المنطقة المضيئة).',
        steps: [
          assemble('iDvdDrive', 53),
          { op: 'rotate', clip: 'iDvdDrive', range: ['lStartRotation', 'lEndRotation'], correct: [[45, 52]], install: 'lInstall',
            say: 'دوّر قارئ الأقراص حتى تكون واجهته نحو الخارج، ثم اضغط «تثبيت».' },
          assemble('iDvdDrive'),
          { op: 'show', clips: ['iDvdScrews'] },
          { op: 'done', part: 'iDvdDrive' },
        ],
      },
      driveScrews('dvdScrews', 'iDvdScrews', 'mcDVDScrews', 'dvd', 'قارئ الأقراص الضوئية', 44),
      {
        id: 'floppy',
        part: 'iFloppyDrive',
        say: 'اسحب قارئ الأقراص المرنة إلى حجرة 3.5 بوصة (المنطقة المضيئة).',
        steps: [
          assemble('iFloppyDrive', 42),
          { op: 'rotate', clip: 'iFloppyDrive', range: ['lStartRotation', 'lEndRotation'], correct: [[38, 41]], install: 'lInstall',
            say: 'دوّر قارئ الأقراص المرنة حتى تكون واجهته نحو الخارج، ثم اضغط «تثبيت».' },
          assemble('iFloppyDrive'),
          { op: 'show', clips: ['iFloppyScrews'] },
          { op: 'done', part: 'iFloppyDrive' },
        ],
      },
      driveScrews('floppyScrews', 'iFloppyScrews', 'mcFloppyScrews', 'floppy', 'قارئ الأقراص المرنة', 45),
    ],
    done: 'أحسنت! قارئا الأقراص مثبّتان في حجرتيهما.',
  },

  6: {
    file: 'InternalCables',
    title: 'الأسلاك الداخلية',
    intro: [
      { op: 'scene', frame: 'lStep1' },
      ...['power4', 'power2', 'power3', 'mcFloppyPower', 'mcHDPower', 'mcDVDPower', 'mcSata', 'mcDVD', 'mcFloppy']
        .map((clip): Step => ({ op: 'goto', clip, frame: 0 })),
    ],
    home: 'lStep1',
    idle: 'اضغط على طرف أحد أسلاك التغذية، أو اسحب كابل بيانات من قائمة القطع.',
    tasks: [
      power('atx', 'power3', 'btn404', 'سلك التغذية الرئيسي ATX (20 دبوسًا)', { stop: 31, range: ['lStartRotation', 'lEndRotation'], correct: [[12, 15], [43, 47]], install: 'lInstall' }, 73),
      power('cpuPower', 'power4', 'btn10', 'سلك تغذية المعالج (4 دبابيس)', { stop: 20, range: ['lStartRotation', 'lEndRotation'], correct: [[2, 6], [34, 37]], install: 'lInstall' }, 87),
      power('fan', 'power2', 'btn222', 'سلك مروحة الصندوق', { stop: 17, range: ['lStartRotation', 'lEndRotation'], correct: [[3, 5], [32, 37]], install: 'lInstall' }, 87),
      power('hdPower', 'mcHDPower', 'btn1267', 'سلك تغذية SATA للقرص الصلب', null, 64),
      power('dvdPower', 'mcDVDPower', 'btn1383', 'سلك تغذية Molex لقارئ الأقراص الضوئية', null, 43),
      power('floppyPower', 'mcFloppyPower', 'btn1086', 'سلك تغذية Berg لقارئ الأقراص المرنة', { stop: 31, range: ['lStartRotation2', 'lEndRotation2'], correct: [[10, 12], [41, 43]], install: 'lInstall2' }, 94),
      data('sata', 'iSata', 'mcSata', 'btn890', 'كابل SATA', 'القرص الصلب',
        { stop: 75, correct: [[49, 53], [80, 85]] }, { stop: 34, correct: [[12, 16], [45, 48]], end: 98 },
        ['mcFloppyPower', 'mcDVDPower', 'mcHDPower']),
      data('pata', 'iPata1', 'mcDVD', 'btn541', 'كابل PATA', 'قارئ الأقراص الضوئية',
        { stop: 56, correct: [[40, 43], [75, 78]] }, { stop: 22, correct: [[27, 30]], end: 69 },
        ['mcFloppyPower', 'mcDVDPower', 'mcHDPower', 'iSata', 'iPata2']),
      data('floppyData', 'iPata2', 'mcFloppy', 'btn719', 'كابل القرص المرن', 'قارئ الأقراص المرنة',
        { stop: 65, correct: [[39, 40], [73, 78]] }, { stop: 29, correct: [[9, 13], [41, 45]], end: 84 },
        ['mcFloppyPower', 'mcDVDPower', 'mcHDPower', 'iSata']),
    ],
    done: 'ممتاز! وصّلت كل أسلاك التغذية وكابلات البيانات داخل الصندوق.',
  },

  7: {
    file: 'ExternalCables',
    title: 'الأسلاك الخارجية',
    intro: [
      {
        op: 'hide',
        clips: ['iPanelScrews', 'iPowerCord', 'iAntenna', 'iMonitor', 'iUSB', 'iMouse', 'iKeyboard', 'iEthernet',
          'mcOutro', 'defaultView', ...PLUGS.map((p) => `defaultView.${p}`)],
      },
      { op: 'scene', frame: 'lStep1' },
    ],
    home: 'lStep1',
    idle: 'وصّل الأسلاك الخارجية بالمنافذ الخلفية للحاسوب. وصّل سلك الكهرباء في الأخير.',
    tasks: [
      {
        id: 'panels',
        part: 'iCasePanels',
        say: 'قبل توصيل الأسلاك الخارجية: اسحب غطاء الصندوق إلى المنطقة المضيئة لإغلاقه.',
        steps: [assemble('iCasePanels'), { op: 'show', clips: ['iPanelScrews'] }, { op: 'done', part: 'iCasePanels' }],
      },
      {
        id: 'panelScrews',
        part: 'iPanelScrews',
        after: ['panels'],
        say: 'اسحب براغي الغطاء إلى المنطقة المضيئة لتثبيته.',
        steps: [
          assemble('iPanelScrews'),
          { op: 'hide', clips: ['iCasePanels', 'iPanelScrews'] },
          { op: 'show', clips: ['defaultView', 'iPowerCord', 'iAntenna', 'iMonitor', 'iUSB', 'iMouse', 'iKeyboard', 'iEthernet'] },
          { op: 'done', part: 'iPanelScrews' },
        ],
      },
      plug('monitor', 'iMonitor', 'monitor', 'كابل الشاشة', 'منفذ VGA لبطاقة الرسوميات', { stop: 118, correct: [[94, 96], [127, 129]] }),
      plug('keyboard', 'iKeyboard', 'keyboard', 'كابل لوحة المفاتيح', 'منفذ PS/2 البنفسجي', { stop: 49, correct: [[25, 27], [59, 61]] }),
      plug('mouse', 'iMouse', 'mouse', 'كابل الفأرة', 'منفذ PS/2 الأخضر', { stop: 49, correct: [[25, 27], [59, 61]] }),
      plug('usb', 'iUSB', 'usb', 'كابل USB', 'منفذ USB', { stop: 48, correct: [[25, 27], [59, 61]] }),
      plug('ethernet', 'iEthernet', 'ethernet', 'كابل الشبكة', 'منفذ الشبكة RJ45', { stop: 48, correct: [[25, 27], [58, 60]] }),
      plug('antenna', 'iAntenna', 'antenna', 'الهوائي اللاسلكي', 'منفذ هوائي بطاقة الشبكة اللاسلكية', null),
      {
        ...plug('power', 'iPowerCord', 'power', 'سلك الكهرباء', 'مقبس علبة التغذية', { stop: 49, correct: [[25, 27], [58, 60]] }),
        after: ['monitor', 'keyboard', 'mouse', 'usb', 'ethernet', 'antenna'],
        say: 'وصّلت كل الأسلاك. الآن، وفي الأخير دائمًا: اسحب سلك الكهرباء إلى مقبس علبة التغذية.',
      },
      {
        id: 'outro',
        after: ['power'],
        say: '',
        steps: [{ op: 'show', clips: ['mcOutro'] }, { op: 'play', clip: 'mcOutro', to: 0 }],
      },
    ],
    done: 'مبروك! جمّعت حاسوبًا كاملًا ووصّلته. أصبح جاهزًا للتشغيل.',
  },
}

// ---- helpers for repeated patterns ----

/** Expansion card: drop into its slot, then drop its screw. */
function card(id: string, part: string, screws: string, name: string, slot: string) {
  return [
    {
      id,
      part,
      say: `اسحب ${name} وضعها في منفذ ${slot} على اللوحة الأم (المنطقة المضيئة).`,
      steps: [assemble(part), { op: 'done', part } as Step],
    },
    {
      id: `${id}Screws`,
      part: screws,
      after: [id],
      say: `ثبّت ${name} في الصندوق: اسحب البرغي إلى المنطقة المضيئة.`,
      steps: [assemble(screws), { op: 'done', part: screws } as Step],
    },
  ]
}

/** Drive screws: the screws land, a screwdriver close-up plays, then they finish. */
function driveScrews(id: string, part: string, anim: string, after: string, name: string, end: number) {
  return {
    id,
    part,
    after: [after],
    say: `اسحب براغي ${name} إلى المنطقة المضيئة لتثبيته.`,
    steps: [
      assemble(part, 1),
      { op: 'show', clips: [anim] },
      { op: 'play', clip: anim, from: 'lStart', to: end },
      assemble(part),
      { op: 'done', part },
    ] as Step[],
  }
}

type Rot = { stop: number; range: [string, string]; correct: [number, number][]; install: string }

/** Power cable: click its loose end, click the socket, (rotate the plug), watch it plug in. */
function power(id: string, clip: string, end: string, name: string, rot: Rot | null, last: number) {
  const steps: Step[] = [
    { op: 'play', clip, to: 1 },
    { op: 'click', clip, targets: ['highlight_mc'], say: `اضغط على المنفذ المضيء على اللوحة الأم أو الجهاز لتوصيل ${name}.` },
    { op: 'view', clips: [clip] },
  ]
  if (rot) {
    steps.push(
      { op: 'play', clip, to: rot.stop },
      { op: 'rotate', clip, range: rot.range, correct: rot.correct, install: rot.install, say: ROTATE('الموصّل') },
    )
  }
  steps.push({ op: 'play', clip, to: last }, { op: 'view', clips: null })
  return { id, start: { clip, target: end }, say: `اضغط على طرف ${name}.`, label: name, steps }
}

/** Data cable: drop one end on the board, rotate, plug; then click its other end and plug it into the drive. */
function data(
  id: string, part: string, far: string, farEnd: string, name: string, device: string,
  near: { stop: number; correct: [number, number][] },
  farRot: { stop: number; correct: [number, number][]; end: number },
  hide: string[],
) {
  const connector = `${part}.mcConnector`
  return {
    id,
    part,
    say: `اسحب ${name} من قائمة القطع وضعه على منفذه في اللوحة الأم (المنطقة المضيئة).`,
    steps: [
      { op: 'hide', clips: hide },
      assemble(part, near.stop),
      { op: 'rotate', clip: part, range: ['lStartRotation', 'lEndRotation'], correct: near.correct, install: 'lInstall', say: ROTATE('الموصّل') },
      assemble(part),
      { op: 'show', clips: hide },
      { op: 'click', clip: connector, targets: [farEnd], say: `اضغط على الطرف الآخر من ${name}.` },
      { op: 'goto', clip: connector, frame: 1 },
      { op: 'click', clip: connector, targets: ['highlight_mc'], say: `اضغط على منفذ ${device} المضيء.` },
      { op: 'goto', clip: connector, frame: 2 },
      { op: 'play', clip: far, from: 0, to: farRot.stop },
      { op: 'rotate', clip: far, range: ['lStartRotation', 'lEndRotation'], correct: farRot.correct, install: 'lInstall', say: ROTATE('الموصّل') },
      { op: 'play', clip: far, to: farRot.end },
      { op: 'done', part },
    ] as Step[],
  }
}

/** Rear-panel cable: close-up, rotate the plug, plug in; the rear view then shows it connected. */
function plug(
  id: string, part: string, rear: string, name: string, port: string,
  rot: { stop: number; correct: [number, number][] } | null,
) {
  const steps: Step[] = [{ op: 'hide', clips: ['defaultView'] }]
  if (rot) {
    steps.push(
      assemble(part, rot.stop),
      { op: 'rotate', clip: part, range: ['lStartRotation', 'lEndRotation'], correct: rot.correct, install: 'lInstall', say: ROTATE('الموصّل') },
    )
  }
  steps.push(assemble(part), { op: 'show', clips: ['defaultView', `defaultView.${rear}`] }, { op: 'done', part })
  return { id, part, after: ['panelScrews'], say: `اسحب ${name} وضعه على ${port} (المنطقة المضيئة).`, steps }
}
