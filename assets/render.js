'use strict';

/*
 * Движок инструкции: строит страницу по описанию из content/instruction.js.
 * Содержимое меняется только там; здесь — разметка типов блоков, рисунки часов и телефона, иконки.
 */

const ICON_PATHS = {
  alarm: '<circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M5 3 2 6M19 3l3 3"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16v.01"/>',
  back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>',
  lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',
  loop: '<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  plug: '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9.5a5.5 5.5 0 0 1 8 0"/><path d="m12 10 1.5-2.5"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
  steps: '<path d="M8 3c1.7 0 2.5 1.8 2.5 4S9.5 12 8 12 5.5 9.2 5.5 7 6.3 3 8 3z"/><path d="M6 14.5h4V16a2 2 0 0 1-4 0z"/><path d="M16 7c1.7 0 2.5 1.8 2.5 4s-1 5-2.5 5-2.5-2.8-2.5-5 .8-4 2.5-4z"/><path d="M14 18.5h4V20a2 2 0 0 1-4 0z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m9 21 2.5-6 2.5 2v4"/><path d="m11.5 15 1-5-3.5 2-1.5 3"/><path d="m12.5 10 2 3 3 1"/>',
  watch: '<circle cx="12" cy="12" r="6"/><path d="M9 6.7 9.5 3h5l.5 3.7M9 17.3l.5 3.7h5l.5-3.7"/><path d="M12 10v2l1.5 1"/>',
};

/*
 * Кнопки часов: номер — как на схеме в руководстве Garmin, angle — положение на корпусе
 * (0° — «три часа», отсчёт по часовой стрелке), side — сторона, на которой стоит подпись.
 */
const WATCH_BUTTONS = {
  upperLeft: { number: 1, angle: 210, side: 'left' },
  middleLeft: { number: 2, angle: 180, side: 'left' },
  lowerLeft: { number: 3, angle: 150, side: 'left' },
  upperRight: { number: 4, angle: -30, side: 'right' },
  lowerRight: { number: 5, angle: 30, side: 'right' },
};

const BLOCK_RENDERERS = {
  buttons: renderButtons,
  cards: renderCards,
  compare: renderCompare,
  flow: renderFlow,
  points: renderPoints,
  screens: renderScreens,
};

// На мелком дисплее часов пункт читается плохо, поэтому он повторяется в подписи; у телефона он и так крупный.
const SCREEN_DEVICES = {
  phone: { renderScreen: renderPhoneScreen, isItemCaptioned: false },
  watch: { renderScreen: renderWatchScreen, isItemCaptioned: true },
};

// Время на нарисованном циферблате — условное.
const WATCH_FACE_TIME = '10:08';
const SECTION_NUMBER_DIGITS_QUANTITY = 2;
// Текущим считается раздел, пересекающий узкую полосу посередине экрана.
const ACTIVE_SECTION_ROOT_MARGIN = '-45% 0px -54% 0px';
// Код выделяется первым: звёздочки внутри него — часть кода, а не выделение.
const CODE_FRAGMENT_PATTERN = /(`[^`]+`)/;
const HIGHLIGHT_PATTERN = /\*\*(.+?)\*\*/g;

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// **выделение** — золотом, `код` — моноширинным.
function formatText(text) {
  return String(text).split(CODE_FRAGMENT_PATTERN).map(formatTextFragment).join('');
}

// split с группой в шаблоне ставит найденный код на нечётные места.
function formatTextFragment(fragment, index) {
  if (index % 2 === 1) {
    return `<code>${escapeHtml(fragment.slice(1, -1))}</code>`;
  }
  return escapeHtml(fragment).replace(HIGHLIGHT_PATTERN, '<strong>$1</strong>');
}

function renderText(text, className, tagName = 'span') {
  if (!text) {
    return '';
  }
  return `<${tagName} class="${className}">${formatText(text)}</${tagName}>`;
}

function renderIcon(name) {
  if (!name) {
    return '';
  }
  if (!(name in ICON_PATHS)) {
    console.warn(`Неизвестная иконка: ${name}`);
    return '';
  }
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

function renderIconBadge(name) {
  const icon = renderIcon(name);
  return icon ? `<span class="icon-badge">${icon}</span>` : '';
}

// Строка-подпись со значком под блоком.
function renderCaption(iconName, text, className) {
  if (!text) {
    return '';
  }
  return `<p class="${className}">${renderIcon(iconName)}<span>${formatText(text)}</span></p>`;
}

function getStateClassName(item) {
  return [item.isAccent && 'is-accent', item.isWarning && 'is-warning'].filter(Boolean).join(' ');
}

function formatSectionNumber(index) {
  return String(index + 1).padStart(SECTION_NUMBER_DIGITS_QUANTITY, '0');
}

function renderTile(item, className) {
  return `
    <li class="tile ${className} ${getStateClassName(item)}">
      ${renderIconBadge(item.icon)}
      <span class="tile-body">
        ${renderText(item.title, 'tile-title')}
        ${renderText(item.text, 'tile-text')}
      </span>
    </li>`;
}

/* ---------- Рисунки часов и телефона ---------- */

function getWatchButton(key) {
  const button = WATCH_BUTTONS[key];
  if (!button) {
    console.warn(`Неизвестная кнопка часов: ${key}`);
  }
  return button;
}

// accentButtonKeys — кнопки, которые нужно подсветить; isNumbered — подписать кнопки номерами.
function renderWatch(displayContent, accentButtonKeys, isNumbered = false) {
  let buttonsMarkup = '';
  for (const [key, button] of Object.entries(WATCH_BUTTONS)) {
    const isAccent = accentButtonKeys.includes(key);
    const numberMarkup = isNumbered && isAccent ? `<span class="watch-button-number">${button.number}</span>` : '';
    buttonsMarkup += `
      <span class="watch-button ${isAccent ? 'is-accent' : ''}" style="--angle: ${button.angle}deg">${numberMarkup}</span>`;
  }
  return `
    <div class="watch" aria-hidden="true">
      <span class="watch-strap"></span>
      <span class="watch-bezel"></span>
      ${buttonsMarkup}
      <span class="watch-display">${displayContent}</span>
    </div>`;
}

function renderWatchFace() {
  return `<span class="watch-time">${WATCH_FACE_TIME}</span>`;
}

// Экран меню: заголовок, пункт, который нужно выбрать, и условные соседние пункты.
function renderWatchMenu(step) {
  return `
    ${renderText(step.title, 'watch-menu-title')}
    <span class="watch-menu-row"></span>
    ${renderText(step.item, 'watch-menu-row is-accent')}
    <span class="watch-menu-row"></span>`;
}

function renderWatchScreen(step) {
  const displayContent = step.isWatchFace ? renderWatchFace() : renderWatchMenu(step);
  const isButtonKnown = Boolean(step.button && getWatchButton(step.button));
  return renderWatch(displayContent, isButtonKnown ? [step.button] : []);
}

// Телефон не скрыт от экранного диктора: пункт на нём в подписи не повторяется, и прочитать его больше негде.
function renderPhoneScreen(step) {
  return `
    <div class="phone">
      <span class="phone-island"></span>
      ${renderText(step.title, 'phone-title')}
      <span class="phone-row"></span>
      <span class="phone-row is-accent">${formatText(step.item)}<span class="phone-chevron"></span></span>
      <span class="phone-row"></span>
    </div>`;
}

/* ---------- Блоки ---------- */

function renderFlow(block) {
  return `<ol class="flow">${block.steps.map(renderFlowStep).join('')}</ol>`;
}

function renderFlowStep(step) {
  return renderTile(step, 'flow-step');
}

function renderPoints(block) {
  return `<ul class="points">${block.items.map(renderPoint).join('')}</ul>`;
}

// Тезис — строка, а объект { text, isWarning } — когда пункт нужно выделить.
function renderPoint(item) {
  const point = typeof item === 'string' ? { text: item } : item;
  return `<li class="point ${getStateClassName(point)}">${formatText(point.text)}</li>`;
}

function renderCards(block) {
  return `<ul class="cards">${block.items.map(renderCard).join('')}</ul>`;
}

function renderCard(item) {
  return renderTile(item, 'card');
}

function renderCompare(block) {
  return `
    <div class="compare" style="--columns-quantity: ${block.columns.length}">
      <span class="compare-cell compare-heading"></span>
      ${block.columns.map(renderCompareHeading).join('')}
      ${renderCompareRows(block.rows, block.columns)}
    </div>`;
}

function renderCompareHeading(column) {
  return `<span class="compare-cell compare-heading">${renderIcon(column.icon)}${escapeHtml(column.title)}</span>`;
}

function renderCompareRows(rows, columns) {
  let markup = '';
  for (const row of rows) {
    markup += `<span class="compare-cell compare-label">${formatText(row.label)}</span>`;
    for (const [index, value] of row.values.entries()) {
      markup += renderCompareValue(value, columns[index]);
    }
  }
  return markup;
}

// Название колонки нужно узкому блоку, где строка сравнения превращается в карточку.
function renderCompareValue(value, column) {
  return `
    <span class="compare-cell compare-value" data-column="${escapeHtml(column.title)}">
      ${formatText(value)}
    </span>`;
}

// Схема часов: рисунок с пронумерованными кнопками, по бокам — что делает каждая из перечисленных.
function renderButtons(block) {
  let leftMarkup = '';
  let rightMarkup = '';
  const accentButtonKeys = [];
  for (const item of block.items) {
    const button = getWatchButton(item.button);
    if (!button) {
      continue;
    }
    accentButtonKeys.push(item.button);
    if (button.side === 'left') {
      leftMarkup += renderButtonCallout(item, button);
    } else {
      rightMarkup += renderButtonCallout(item, button);
    }
  }
  return `
    <div class="buttons">
      <ol class="buttons-callouts">${leftMarkup}</ol>
      <div class="buttons-watch">${renderWatch(renderWatchFace(), accentButtonKeys, true)}</div>
      <ol class="buttons-callouts">${rightMarkup}</ol>
    </div>`;
}

function renderButtonCallout(item, button) {
  return `
    <li class="tile button-callout ${getStateClassName(item)}">
      <span class="button-callout-number">${button.number}</span>
      <span class="tile-body">
        ${renderText(item.title, 'tile-title')}
        <ul class="button-actions">${item.actions.map(renderButtonAction).join('')}</ul>
      </span>
    </li>`;
}

function renderButtonAction(text) {
  return `<li class="button-action">${formatText(text)}</li>`;
}

// Цепочка экранов «куда нажать»: на часах или в телефоне.
function renderScreens(block) {
  const device = SCREEN_DEVICES[block.device];
  if (!device) {
    console.warn(`Неизвестное устройство: ${block.device}`);
    return '';
  }
  let stepsMarkup = '';
  for (const step of block.steps) {
    const captionItem = device.isItemCaptioned ? renderText(step.item, 'screen-caption-item') : '';
    const captionContent = captionItem + renderText(step.text, 'screen-caption-text');
    stepsMarkup += `
      <li class="screen-step">
        <div class="screen-device">${device.renderScreen(step)}</div>
        ${captionContent ? `<p class="screen-caption">${captionContent}</p>` : ''}
      </li>`;
  }
  return `<ol class="screens screens--${block.device}">${stepsMarkup}</ol>`;
}

function renderBlock(block) {
  const renderContent = BLOCK_RENDERERS[block.type];
  if (!renderContent) {
    console.warn(`Неизвестный тип блока: ${block.type}`);
    return '';
  }
  const classNames = ['block', `block--${block.type}`];
  if (block.isHalf) {
    classNames.push('block--half');
  }
  if (block.isSpotlight) {
    classNames.push('is-spotlight');
  }
  return `
    <article class="${classNames.join(' ')}">
      ${renderText(block.title, 'block-title', 'h3')}
      ${renderContent(block)}
      ${renderCaption(block.noteIcon, block.note, 'block-note')}
    </article>`;
}

function renderBlocks(blocks) {
  if (!blocks) {
    return '';
  }
  return `<div class="blocks">${blocks.map(renderBlock).join('')}</div>`;
}

/* ---------- Каркас страницы ---------- */

function renderNavigationLink(item, numberText) {
  return `
    <a class="navigation-link" href="#${item.id}" data-target="${item.id}">
      ${renderIcon(item.icon)}
      <span>${escapeHtml(item.shortTitle)}</span>
      ${renderText(numberText, 'navigation-number')}
    </a>`;
}

function renderSectionLink(section, index) {
  return renderNavigationLink(section, formatSectionNumber(index));
}

function renderSidebar(instruction) {
  return `
    <a class="brand" href="#${instruction.cover.id}">
      ${renderIcon('watch')}${escapeHtml(instruction.brand)}
    </a>
    <nav class="navigation">
      ${renderNavigationLink(instruction.cover, '')}
      ${instruction.sections.map(renderSectionLink).join('')}
    </nav>`;
}

function renderTableOfContentsCard(section, index) {
  return `
    <a class="tile contents-card" href="#${section.id}">
      <span class="contents-number">${formatSectionNumber(index)}</span>
      ${renderIconBadge(section.icon)}
      <span class="tile-title">${escapeHtml(section.shortTitle)}</span>
      ${renderText(section.summary, 'tile-text')}
    </a>`;
}

function renderCover(instruction) {
  const cover = instruction.cover;
  return `
    <header class="section cover" id="${cover.id}" data-section>
      <div class="section-header">
        <p class="kicker">${escapeHtml(cover.kicker)}</p>
        ${renderText(cover.title, 'cover-title', 'h1')}
        ${renderText(cover.lead, 'lead', 'p')}
      </div>
      <nav class="contents">${instruction.sections.map(renderTableOfContentsCard).join('')}</nav>
      ${renderBlocks(cover.blocks)}
    </header>`;
}

function renderSection(section, index) {
  return `
    <section class="section" id="${section.id}" data-section>
      <header class="section-header">
        <p class="kicker">${formatSectionNumber(index)} · ${escapeHtml(section.kicker)}</p>
        ${renderText(section.title, 'section-title', 'h2')}
        ${renderText(section.lead, 'lead', 'p')}
      </header>
      ${renderBlocks(section.blocks)}
    </section>`;
}

function highlightNavigationLink(sectionId) {
  for (const $link of document.querySelectorAll('.navigation-link')) {
    const isActive = $link.dataset.target === sectionId;
    $link.classList.toggle('is-active', isActive);
    if (isActive) {
      revealNavigationLink($link);
    }
  }
}

// На узком экране меню — прокручиваемая полоса сверху: скрытый за краем текущий пункт выводится на её середину.
// На широком полоса не прокручивается, и пункт всегда виден.
function revealNavigationLink($link) {
  const $sidebar = document.getElementById('sidebar');
  const linkStart = $link.offsetLeft;
  const linkEnd = linkStart + $link.offsetWidth;
  const isVisible = linkStart >= $sidebar.scrollLeft && linkEnd <= $sidebar.scrollLeft + $sidebar.clientWidth;
  if (isVisible) {
    return;
  }
  $sidebar.scrollTo({
    left: linkStart - ($sidebar.clientWidth - $link.offsetWidth) / 2,
    behavior: 'smooth',
  });
}

function handleSectionIntersections(entries) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      highlightNavigationLink(entry.target.id);
    }
  }
}

function observeActiveSection() {
  const observer = new IntersectionObserver(handleSectionIntersections, { rootMargin: ACTIVE_SECTION_ROOT_MARGIN });
  for (const $section of document.querySelectorAll('[data-section]')) {
    observer.observe($section);
  }
}

function renderPage(instruction) {
  document.title = instruction.title;
  document.getElementById('sidebar').innerHTML = renderSidebar(instruction);
  document.getElementById('content').innerHTML =
    renderCover(instruction) + instruction.sections.map(renderSection).join('');
  observeActiveSection();
}

renderPage(window.instruction);
