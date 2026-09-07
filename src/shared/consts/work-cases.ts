import { ECodeExamples } from 'app/codeExamples'

export type WorkCaseKind = 'primary' | 'secondary' | 'archive'

export interface WorkCaseDemo {
    label: string
    /** Public folder / iframe id, e.g. tariffPrices */
    demoId: string
    href: string
}

export interface WorkCase {
    slug: string
    order: number
    featured: boolean
    kind: WorkCaseKind
    title: string
    seoTitle?: string
    metaDescription: string
    hook: string
    problem: string
    solution: string
    effect: string
    stack: string[]
    role: string
    originalStackNote?: string
    demos?: WorkCaseDemo[]
    guides?: string[]
    relatedSlugs?: string[]
}

const demoHref = (id: string) => `/demo/${id}`

/** Bnovo + secondary cases. Order matches «вау» 1→3→2→4→5→6→7 then secondary. */
export const WORK_CASES: WorkCase[] = [
    {
        slug: 'tariff-calendar',
        order: 1,
        featured: true,
        kind: 'primary',
        title: 'Виртуализированный календарь тарифов',
        seoTitle: 'Виртуализированный календарь цен и ограничений',
        metaDescription:
            'Кейс: сетка 365 дней × N категорий с inline-edit, двухфазным fetch и virtualizer — без подвисаний. Демо с живым API.',
        hook: 'Ежедневный инструмент отельера: сетка 365 дней × N категорий с ценами, ограничениями и массовым редактированием — без подвисаний при скролле и без полной перезагрузки после каждой правки.',
        problem:
            'Наивный рендер года × категорий плюс несколько слоёв цен убивает FPS и память. Полный GET после save — долго и дёргает UI.',
        solution:
            'Двухфазный fetch (shell → content-parts), cell view-model из модели + черновиков, вертикальный virtualizer с freeze пула на mobile-edit, partial refetch только затронутых parts после save.',
        effect:
            'Ownership ключевого revenue/ops-экрана PMS; документированная архитектура для онбординга; unit-покрытие критичной логики. В демо можно править ячейки и сохранить — ответ приходит с живого API.',
        stack: ['Vue 3', 'Vuex', 'Vuetify 3', 'Vite', 'MSW / live API', 'Jest'],
        role: 'Middle+ Frontend / ключевой разработчик модуля',
        demos: [
            {
                label: 'Открыть календарь тарифов',
                demoId: ECodeExamples.TARIFF_PRICES,
                href: demoHref(ECodeExamples.TARIFF_PRICES),
            },
        ],
        guides: [
            'Переключайте режимы цен / ограничений',
            'Отредактируйте ячейку и нажмите Сохранить',
            'Прокрутите длинный горизонт — строки виртуализированы',
        ],
        relatedSlugs: ['mobile-webview-edit', 'availability-spa', 'rms-layers'],
    },
    {
        slug: 'mobile-webview-edit',
        order: 2,
        featured: true,
        kind: 'primary',
        title: 'Mobile editing в Safari / WebView',
        seoTitle: 'Mobile UX календаря тарифов в WebView',
        metaDescription:
            'Кейс: стабильный ввод цен с телефона при sticky-шапках и виртуализаторе — visualViewport, freeze pool, flush черновика.',
        hook: 'Отельер правит цены с телефона внутри hybrid WebView: клавиатура, sticky-шапки и виртуализатор не должны срывать ввод или «съедать» черновик при тапе «Сохранить».',
        problem:
            'На iOS/Android/WebView smooth scroll закрывает клавиатуру, blur без relatedTarget, resize remount\'ит строку виртуализатора, тап «Сохранить» приходит когда фокус уже не в input.',
        solution:
            'Слой pure-helpers: edit-session, scroll-into-view с clamp, freeze virtualizer pool, flush по last-focused cell key, device-specific guard\'ы вместо «магии в компоненте».',
        effect:
            'Стабильный мобильный UX на самом нагруженном экране; Playwright-поверхности desktop / mobile / Android WebView.',
        stack: ['Vue', 'visualViewport', 'Virtual Keyboard API', 'Playwright'],
        role: 'Frontend · hybrid UX ownership',
        demos: [
            {
                label: 'Тот же календарь (откройте с телефона)',
                demoId: ECodeExamples.TARIFF_PRICES,
                href: demoHref(ECodeExamples.TARIFF_PRICES),
            },
        ],
        guides: [
            'Откройте демо на телефоне или в DevTools device mode',
            'Тапните ячейку цены — input должен остаться в фокусе при скролле',
            'Сохраните с открытой клавиатурой',
        ],
        relatedSlugs: ['tariff-calendar'],
    },
    {
        slug: 'availability-spa',
        order: 3,
        featured: false,
        kind: 'primary',
        title: 'Availability: с legacy PHP на Vue SPA',
        seoTitle: 'Редактирование availability в Channel Manager SPA',
        metaDescription:
            'Кейс: перенос inventory с legacy MCP на SPA-календарь — inline, bulk weekday-grid, merge после save.',
        hook: 'Перенос редактирования наличия номеров с legacy PHP Channel Manager UI на современный SPA-календарь — с inline и bulk, без рассинхрона UI после сохранения.',
        problem:
            'Legacy jQuery AJAX жили отдельно от SPA. Bulk-пейлоад — weekday-grid, а read-model — roomtype → дата → int. GET meta после save мог вернуть устаревшие данные.',
        solution:
            'Rollout platform → inline → bulk drawer; endpoint updateMassiveAvailability; expand weekday grid в day-tree; merge сохранённых значений поверх meta, чтобы UI сразу отражал пост-save состояние.',
        effect:
            'Единый UX тарифов + наличия для CM-клиентов; стабильный save/merge на критичном контуре синхронизации с каналами.',
        stack: ['Vue', 'Vuex', 'REST', 'Channel Manager domain'],
        role: 'Frontend · inventory / CM',
        demos: [
            {
                label: 'Календарь с availability',
                demoId: ECodeExamples.TARIFF_PRICES,
                href: demoHref(ECodeExamples.TARIFF_PRICES),
            },
        ],
        guides: [
            'В демо availability доступна в ячейках наличия',
            'Попробуйте bulk-изменение и сохранение',
            'После save значения остаются согласованными без «прыжка» назад',
        ],
        relatedSlugs: ['tariff-calendar', 'rms-layers'],
    },
    {
        slug: 'xlsx-streaming',
        order: 4,
        featured: false,
        kind: 'primary',
        title: 'Streaming-выгрузка цен в XLSX',
        seoTitle: 'Потоковая Excel-выгрузка цен тарифа',
        metaDescription:
            'Кейс: отказ от полной CellDto-матрицы в пользу streaming pipeline — выгрузка без OOM на длинных периодах. Интерактивный demo + API.',
        hook: 'Отельеру нужна Excel-выгрузка цен на длинный период. Классический PHPExcel + полная матрица ячеек → OOM на больших отелях. Перевёл пайплайн на потоковую запись.',
        problem:
            'Batch build держал всю матрицу периода в RAM; dual per_day падал по памяти на loadtest.',
        solution:
            'StreamingExporter: окна prices → dayVector → online grouper / write column → discard. Sparse write, без полной матрицы. На сайте — Node-эквивалент идеи (оригинал в проде — PHP 8).',
        effect:
            'Выгрузка проходит на кейсах, где раньше был OOM; понятный pipeline и метрики.',
        stack: ['PHP 8 (прод)', 'Node stream (демо)', 'XLSX'],
        role: 'Full-stack · perf',
        originalStackNote: 'В проде — PHP StreamingExporter; демо показывает тот же pipeline на Node.',
        demos: [
            {
                label: 'Pipeline + скачать XLSX',
                demoId: 'xlsxPipeline',
                href: demoHref('xlsxPipeline'),
            },
        ],
        guides: [
            'Запустите выгрузку и следите за этапами pipeline',
            'Скачайте файл — он собран потоково на API',
            'Сравните с «наивной» полной матрицей в подсказке по памяти',
        ],
    },
    {
        slug: 'revenue-report',
        order: 5,
        featured: true,
        kind: 'primary',
        title: 'Отчёт «Доход, ADR, Загрузка»',
        seoTitle: 'Revenue-отчёт ADR / RevPAR / occupancy',
        metaDescription:
            'Кейс: revenue-экран с ADR, RevPAR, occupancy, сравнением периодов и Excel. Интерактивное демо с живым API.',
        hook: 'Revenue-экран для отельера: ADR / RevPAR / occupancy, графики, фильтры, сравнение периодов, Excel — с onboarding-туром.',
        problem:
            'Точные float-метрики, тяжёлая Excel-генерация на 50+ категориях, UX сравнения двух периодов без путаницы в %.',
        solution:
            'FE comparison-стратегии + Chart.js; BE collectors; range-стили в Excel; e2e на compare-виджеты. Демо ходит в /api/demos/revenue.',
        effect:
            'Полноценный revenue-контур рядом с тарифами.',
        stack: ['Vue 3', 'Chart.js', 'Vuex', 'Excel export'],
        role: 'Frontend · revenue analytics',
        demos: [
            {
                label: 'Открыть отчёт',
                demoId: ECodeExamples.REPORT_REVENUE,
                href: demoHref(ECodeExamples.REPORT_REVENUE),
            },
        ],
        guides: [
            'Смените период и категории',
            'Посмотрите метрики ADR / RevPAR / occupancy',
            'При сравнении периодов проверьте % без ложной окраски нуля',
        ],
        relatedSlugs: ['tariff-calendar'],
    },
    {
        slug: 'once-migration',
        order: 6,
        featured: false,
        kind: 'primary',
        title: 'Once-миграция с resume',
        seoTitle: 'Chunked data-fix с resume на больших таблицах',
        metaDescription:
            'Кейс: once-task с чанками и --start_hotel_id для возобновления после сбоя. Интерактивный demo job runner.',
        hook: 'Исправление некорректных данных в проде на больших таблицах без bulk-UPDATE по всей базе: чанки, курсор, resume после сбоя.',
        problem:
            'Bulk UPDATE по всей таблице — риск таймаутов и локов. Нужны dry-run, прогресс и безопасный resume.',
        solution:
            'Пошагово по hotel_id, SQL-чанки по booking_id, стоп с подсказкой resume. Демо — job runner на Postgres с курсором.',
        effect:
            'Контролируемый data-fix в проде; паттерн для других once-задач. Доказательство end-to-end ownership за пределами SPA.',
        stack: ['PHP 8 Minion (прод)', 'Node + PostgreSQL (демо)', 'chunked jobs'],
        role: 'Full-stack · data / ops',
        originalStackNote: 'В проде — Kohana Minion once-task; демо повторяет контракт resume на Node.',
        demos: [
            {
                label: 'Запустить миграцию',
                demoId: 'onceMigration',
                href: demoHref('onceMigration'),
            },
        ],
        guides: [
            'Запустите dry-run, затем apply',
            'Остановите mid-run и продолжите с сохранённого hotel_id',
            'Смотрите лог прогресса по чанкам',
        ],
    },
    {
        slug: 'rms-layers',
        order: 7,
        featured: true,
        kind: 'primary',
        title: 'RMS-слои и зависимые тарифы',
        seoTitle: 'Динамическое ценообразование в календаре тарифов',
        metaDescription:
            'Кейс: базовые цены, RMS sale-слой и зависимые тарифы в одном календаре — layer routing, echo vs manual, stable cellKey.',
        hook: 'В одном календаре — базовые цены, цены продажи по бизнес-правилам (RMS) и зависимые тарифы от родителя. Нужно правильно грузить слои и роутить save.',
        problem:
            'Несколько источников истины; RMS-эхо нельзя считать manual; у зависимого тарифа baseline — формула от родителя. Неверный refetch → мигание ячеек.',
        solution:
            'Явный price-layer routing, ensureDynamicPartBeforePriceSave, resolve baseline/reset, cellKey-anchor для overlay, точечный refetch.',
        effect:
            'Корректный UX динамического ценообразования на том же экране, что и ручные тарифы — сильный travel-tech сюжет.',
        stack: ['Vue', 'Vuex', 'RMS domain', 'Jest'],
        role: 'Frontend · domain FE+BE contract',
        demos: [
            {
                label: 'Календарь с RMS-режимами',
                demoId: ECodeExamples.TARIFF_PRICES,
                href: demoHref(ECodeExamples.TARIFF_PRICES),
            },
        ],
        guides: [
            'Переключите режим RMS / combined',
            'Отличите ручной override от RMS-эха',
            'Сохраните и убедитесь в точечном обновлении',
        ],
        relatedSlugs: ['tariff-calendar', 'availability-spa'],
    },
    {
        slug: 'divisions',
        order: 20,
        featured: false,
        kind: 'secondary',
        title: 'Divisions',
        metaDescription: 'Модуль оргструктуры на Lit Web Components — CRUD, FSD, демо без production API.',
        hook: 'Админка подразделений и ресурсных пулов на Lit / Web Components.',
        problem: 'Нужна FSD-архитектура на Web Components с типизацией и демо без production backend.',
        solution: 'TypeScript, Lit, FSD, MSW-моки legacy ASMX.',
        effect: 'Интерактивное демо со списком подразделений и CRUD.',
        stack: ['TypeScript', 'Lit', 'FSD', 'MSW'],
        role: 'Frontend · First Line Software',
        demos: [
            {
                label: 'Открыть Divisions',
                demoId: ECodeExamples.DIVISIONS,
                href: demoHref(ECodeExamples.DIVISIONS),
            },
        ],
    },
    {
        slug: 'family-meals',
        order: 21,
        featured: false,
        kind: 'secondary',
        title: 'Family Meal Planning',
        metaDescription: 'Pet-project: рецепты → недельный план → список покупок. Vue 3 MFE / BFF.',
        hook: 'Pet: библиотека рецептов, план питания и список покупок.',
        problem: 'Собрать UX-сценарий end-to-end без тяжёлого backend в портфолио.',
        solution: 'Vue 3, Module Federation (pet), MSW-демо.',
        effect: 'Полный UX-сценарий в iframe.',
        stack: ['Vue 3', 'Module Federation', 'MSW'],
        role: 'Pet full-stack',
        demos: [
            {
                label: 'Открыть демо',
                demoId: ECodeExamples.FAMILY_MEALS,
                href: demoHref(ECodeExamples.FAMILY_MEALS),
            },
        ],
    },
    {
        slug: 'vball-agregator',
        order: 22,
        featured: false,
        kind: 'secondary',
        title: 'VBallAgregator',
        metaDescription: 'Pet Telegram-бот: запись на игры, Prisma, outbox, Redis.',
        hook: 'Pet-project: Telegram-сервис для волейбольных игр и записи.',
        problem: 'Надёжная интеграция ботов с БД и очередями.',
        solution: 'Node, Prisma, PostgreSQL, Redis, outbox.',
        effect: 'Прототип дошёл до стадии тестирования; развитие остановлено осознанно.',
        stack: ['Node', 'Prisma', 'PostgreSQL', 'Redis'],
        role: 'Pet backend',
    },
]

export const getWorkCaseBySlug = (slug: string): WorkCase | undefined =>
    WORK_CASES.find(item => item.slug === slug)

export const getFeaturedWorkCases = (): WorkCase[] =>
    WORK_CASES.filter(item => item.featured).sort((a, b) => a.order - b.order)

export const getPrimaryWorkCases = (): WorkCase[] =>
    WORK_CASES.filter(item => item.kind === 'primary').sort((a, b) => a.order - b.order)

export const getSecondaryWorkCases = (): WorkCase[] =>
    WORK_CASES.filter(item => item.kind === 'secondary').sort((a, b) => a.order - b.order)

/** Map old portfolio case slugs → work slugs for redirects */
export const PORTFOLIO_TO_WORK_SLUG: Record<string, string> = {
    'tariff-prices': 'tariff-calendar',
    'report-revenue': 'revenue-report',
    divisions: 'divisions',
    'family-meals': 'family-meals',
    'vball-agregator': 'vball-agregator',
    racketmate: 'vball-agregator',
}
