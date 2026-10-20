export const notoriaArts = [
  {
    id: 'grammar',
    title: 'Граматика',
    group: 'Trivium',
    description: 'Мова, читання й будова висловлювання.',
    witness: 'Sloane MS 1712, ff. 14v–15v: три ноти граматики.',
  },
  {
    id: 'logic',
    title: 'Логіка / діалектика',
    group: 'Trivium',
    description: 'Послідовність міркувань, поняття та аргументи.',
    witness: 'Sloane MS 1712, ff. 16v, 17v: дві ноти діалектики.',
  },
  {
    id: 'rhetoric',
    title: 'Риторика',
    group: 'Trivium',
    description: 'Побудова промови, виразність і переконливість.',
    witness: 'Sloane MS 1712, ff. 18r–19r: чотири ноти риторики.',
  },
  {
    id: 'arithmetic',
    title: 'Арифметика',
    group: 'Quadrivium',
    description: 'Числа та відношення між ними.',
    witness: 'Sloane MS 1712, f. 36v: нота арифметики в Opus Operum.',
  },
  {
    id: 'geometry',
    title: 'Геометрія',
    group: 'Quadrivium',
    description: 'Форми, величини та просторові відношення.',
    witness: 'Sloane MS 1712, f. 19r: нота геометрії; f. 37r — в Opus Operum.',
  },
  {
    id: 'music',
    title: 'Музика',
    group: 'Quadrivium',
    description: 'Гармонія, ритм і числові пропорції звуку.',
    witness: 'Одна із семи вільних наук; окремий аркуш ноти тут не приписується.',
  },
  {
    id: 'astronomy',
    title: 'Астрономія',
    group: 'Quadrivium',
    description: 'Небесні рухи та їх математичний опис.',
    witness: 'Астрономію названо серед предметів Ars Notoria у каталозі Sloane MS 1712.',
  },
];
export const notoriaPrayers = [
  {
    id: 'alpha',
    title: 'Alpha et Omega',
    incipit: 'Alpha & Omega, Deus Omnipotens',
    role: 'Загальне звернення',
    explanation:
      'Прохання про милість, ясність розуму, пам’ять, розуміння та витривалість у навчанні. Християнське звернення до Бога, Христа і Святого Духа.',
    locator: 'Turner, 1657, друковані с. 2–3. Інципіт наведено латиною за паралельним текстом.',
  },
  {
    id: 'hely',
    title: 'Hely Scemath',
    incipit: 'Hely Scemath, Amazaz, Hemel',
    role: 'Сакральні імена',
    explanation:
      'Послідовність незвичайних імен і складів, яку текст подає як одкровення Соломонові. Це фрагмент початку, не повна молитва; довільний «переклад» цих слів тут не пропонується.',
    locator: 'Turner, 1657, розділ про перше одкровення; інципіт у тексті видання.',
  },
  {
    id: 'conclusion',
    title: 'Завершення та утвердження знання',
    incipit: 'Oh God, Maker of all things',
    role: 'Завершення',
    explanation:
      'Прохання до Творця допомогти досягти мети мистецтва, зберегти отримане знання та виявити милість.',
    locator: 'Turner, 1657, с. 110: завершення твору.',
  },
  {
    id: 'study',
    title: 'Перед читанням, навчанням або диспутом',
    incipit: 'Remember me O Lord of Lords',
    role: 'Навчання й мовлення',
    explanation:
      'Прохання про правильне й переконливе мовлення на славу Бога. Це приклад із прикінцевого матеріалу, пов’язаного з Ars Brevis, а не універсальна молитва для кожної ноти.',
    locator: 'Turner, 1657, с. 125; у паралельному тексті — Ars Brevis, § 40.',
  },
];
export const notoriaFigures = [
  {
    id: 'grammar',
    title: 'Перша фігура граматики',
    manuscript: 'Paris, BnF, Latin 9336, f. 18',
    description:
      'Рукописна нота граматики: історичне зображення з літерами, текстовими смугами та геометричною композицією.',
    image: '/catalogues/artwork/ars-notoria/grammar.jpg',
    width: 599,
    height: 866,
    source: 'https://commons.wikimedia.org/wiki/File:The_first_figure_of_grammar.jpg',
    credit:
      'Відтворення: Matthew Oser (метадані); завантажувач Haplo1990. Середньовічний автор невідомий.',
  },
  {
    id: 'logic',
    title: 'Перша фігура логіки / діалектики',
    manuscript: 'Oxford, Bodleian Library, Bodley 951, f. 10v',
    description:
      'Приклад фігури редакції B. Кругова композиція поєднує кілька груп знаків і текстів; її будова відрізняється від ранніх варіантів.',
    image: '/catalogues/artwork/ars-notoria/logic.jpg',
    width: 635,
    height: 861,
    source: 'https://commons.wikimedia.org/wiki/File:First-logic-version-b-bodley951-f.10v.jpg',
    credit: 'Відтворення: Haplo1990 / Wikimedia Commons. Середньовічний автор невідомий.',
  },
];
export const notoriaSources = [
  {
    id: 'sloane',
    title: 'British Library · Sloane MS 1712',
    url: 'https://searcharchives.bl.uk/catalog/040-002114063',
    description:
      'Латинський рукопис XIII століття. Каталожний опис нот, їхніх предметів і аркушів; Ars Notoria та окремо Opus Operum.',
  },
  {
    id: 'harley',
    title: 'British Library · Harley MS 181',
    url: 'https://searcharchives.bl.uk/catalog/040-002046009',
    description:
      'Англійський рукопис другої половини XVI століття: молитви, імена та діаграми. Приклад іншого складу збірника.',
  },
  {
    id: 'turner',
    title: 'Robert Turner · Ars Notoria, 1657',
    url: 'https://www.esotericarchives.com/notoria/notoria.htm',
    description:
      'Історичний англійський текст із паралельними матеріалами та редакторськими примітками Joseph H. Peterson. Повні молитви доступні у джерелі.',
  },
  {
    id: 'figures',
    title: 'Matthias Castle · Visual Guide, Part I',
    url: 'https://www.matthiascastle.com/post/visual-guide-to-the-notory-art-figures-of-angelic-magic-part-i',
    description:
      'Дослідження змін фігур граматики та діалектики між редакціями A, A2 і B. Сучасний коментар, не середньовічний текст.',
  },
];
