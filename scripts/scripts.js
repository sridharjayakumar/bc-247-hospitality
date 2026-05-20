import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/** Material / AEM icon labels → Font Awesome 6 solid class (without fa-solid prefix). */
const AMENITY_FA_ICONS = {
  bed: 'fa-bed',
  coffee: 'fa-mug-hot',
  wifi: 'fa-wifi',
  concierge: 'fa-bell-concierge',
  pool: 'fa-person-swimming',
  nightlight: 'fa-moon',
  nightlight_round: 'fa-moon',
  lock: 'fa-lock',
  bathtub: 'fa-bath',
  bath_private: 'fa-bath',
  ring: 'fa-gem',
  flower: 'fa-spa',
  spa: 'fa-spa',
  local_florist: 'fa-seedling',
};

/**
 * @param {string} label
 * @returns {string}
 */
function getAmenityFaClass(label) {
  const key = label.trim().toLowerCase().replace(/\s+/g, '_');
  return AMENITY_FA_ICONS[key] || 'fa-circle-question';
}

/**
 * Text nodes before this element (e.g. bare AEM icon label "bed").
 * @param {Element} parent
 * @param {ChildNode} stopBefore
 * @returns {string}
 */
function collectTextBefore(parent, stopBefore) {
  let text = '';
  for (const node of parent.childNodes) {
    if (node === stopBefore) break;
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {Element} */ (node);
      if (el.classList.contains('amenity-icon')) continue;
      if (el.tagName === 'P' && !el.querySelector('h4')) text += el.textContent;
    }
  }
  return text.trim();
}

/**
 * Remove icon-label nodes before stopBefore.
 * @param {Element} parent
 * @param {ChildNode} stopBefore
 */
function removeNodesBefore(parent, stopBefore) {
  const remove = [];
  for (const node of parent.childNodes) {
    if (node === stopBefore) break;
    if (node.nodeType === Node.TEXT_NODE) {
      remove.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {Element} */ (node);
      if (el.classList.contains('amenity-icon')) continue;
      if (el.tagName === 'P' && !el.querySelector('h4')) remove.push(node);
    }
  }
  remove.forEach((node) => node.remove());
}

/**
 * Wrap trailing text after h4 into <p class="amenity-desc">.
 * @param {Element} item
 * @param {Element} title
 */
function normalizeAmenityDescription(item, title) {
  const parts = [];
  const remove = [];
  let afterTitle = false;
  item.childNodes.forEach((node) => {
    if (node === title) {
      afterTitle = true;
      return;
    }
    if (!afterTitle) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim();
      if (t) parts.push(t);
      remove.push(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = /** @type {Element} */ (node);
      if (el.tagName === 'P' && !el.classList.contains('amenity-icon')) {
        parts.push(el.textContent.trim());
        remove.push(node);
      }
    }
  });
  remove.forEach((node) => node.remove());
  const text = parts.join(' ').trim();
  if (!text) return;
  let desc = item.querySelector(':scope > p.amenity-desc');
  if (!desc) {
    desc = document.createElement('p');
    desc.className = 'amenity-desc';
    item.append(desc);
  }
  desc.textContent = text;
}

/**
 * @param {Element} item
 * @param {string} iconName
 * @returns {HTMLElement}
 */
function createAmenityIcon(item, iconName) {
  const existing = item.querySelector(':scope > .amenity-icon');
  if (existing) return existing;

  const icon = document.createElement('i');
  icon.className = `amenity-icon fa-solid ${getAmenityFaClass(iconName)}`;
  icon.dataset.iconName = iconName;
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}

/**
 * Rooms amenities — AEM flattens icons to bare text; restore grid + FA icons.
 * @param {Element} main
 */
export function decorateFeatureGrid(main) {
  main.querySelectorAll('.section.feature-grid').forEach((section) => {
    const wrapper = section.querySelector(':scope > div');
    if (!wrapper) return;

    const heading = wrapper.querySelector(':scope > h2');
    if (heading) heading.classList.add('feature-grid-heading');

    const lead = wrapper.querySelector(':scope > p');
    if (lead && !lead.closest('li')) lead.classList.add('feature-grid-lead');

    const list = wrapper.querySelector('ul');
    if (!list || list.dataset.featureGridDecorated === 'true') return;

    list.classList.add('feature-grid-list');

    [...list.children].forEach((item) => {
      if (item.tagName !== 'LI') return;
      item.classList.add('amenity');

      const title = item.querySelector(':scope > h4');
      if (title) {
        const iconName = collectTextBefore(item, title);
        if (!iconName) return;
        removeNodesBefore(item, title);
        const icon = createAmenityIcon(item, iconName);
        item.insertBefore(icon, title);
        normalizeAmenityDescription(item, title);
        return;
      }

      const existing = item.querySelector(':scope > .amenity-icon');
      const iconLabel = existing || item.querySelector(':scope > p');
      if (!iconLabel) return;

      const iconName = existing
        ? (existing.dataset.iconName || existing.textContent.trim())
        : iconLabel.textContent.trim();
      if (!iconName) return;

      const icon = createAmenityIcon(item, iconName);
      if (iconLabel !== existing) iconLabel.replaceWith(icon);
      else existing.replaceWith(icon);
    });

    list.dataset.featureGridDecorated = 'true';
  });
}

/** @deprecated Use decorateFeatureGrid */
export const decorateAmenities = decorateFeatureGrid;

const WEDDINGS_VENUE_TAGS = ['Indoor Elegance', 'Coastal Al Fresco'];
const WEDDINGS_VENUE_ICONS = ['fa-users', 'fa-champagne-glasses'];
const CULINARY_FEATURE_ICONS = ['fa-check', 'fa-wine-glass'];

/**
 * Weddings page — DOM enhancements for Stitch layout.
 * @param {Element} main
 */
export function decorateWeddings(main) {
  const heroSection = main.querySelector('.section.hero');
  const hero = heroSection?.querySelector('.hero');
  if (hero) {
    const ctas = [...hero.querySelectorAll('p')].find((p) => p.querySelectorAll('a[href^="mailto:"]').length >= 2);
    if (ctas) {
      ctas.classList.add('weddings-hero-ctas');
      const links = ctas.querySelectorAll('a');
      links[0]?.classList.add('button');
      if (links[1]) {
        links[1].classList.add('button', 'secondary');
      }
    }
  }

  const venuesSection = main.querySelector('.section.wide:has(.cards)');
  if (venuesSection) {
    venuesSection.classList.add('weddings-venues');
    const cards = venuesSection.querySelector('.cards');
    cards?.classList.add('weddings-venues-cards');
    venuesSection.querySelectorAll('.cards.weddings-venues-cards > ul > li').forEach((li, index) => {
      const imageWrap = li.querySelector('.cards-card-image');
      if (imageWrap && !imageWrap.querySelector('.venue-tag')) {
        const tag = document.createElement('span');
        tag.className = 'venue-tag';
        tag.textContent = WEDDINGS_VENUE_TAGS[index] || '';
        imageWrap.append(tag);
      }
      const body = li.querySelector('.cards-card-body');
      const capacityLink = body?.querySelector('a[href^="mailto:"]');
      if (capacityLink && !body.querySelector('.venue-capacity')) {
        const capacityP = capacityLink.closest('p');
        const row = document.createElement('p');
        row.className = 'venue-capacity';
        const icon = document.createElement('i');
        icon.className = `venue-capacity-icon fa-solid ${WEDDINGS_VENUE_ICONS[index] || 'fa-users'}`;
        icon.setAttribute('aria-hidden', 'true');
        row.append(icon, capacityLink);
        if (capacityP) capacityP.replaceWith(row);
        else body.append(row);
      }
    });
  }

  const amenitiesSection = main.querySelector('.section.feature-grid');
  if (amenitiesSection && !amenitiesSection.querySelector('.weddings-amenities-layout')) {
    amenitiesSection.classList.add('weddings-amenities');
    const wrapper = amenitiesSection.querySelector(':scope > div');
    if (wrapper) {
      const list = wrapper.querySelector('ul');
      const introBits = [...wrapper.children].filter((el) => el !== list);
      const layout = document.createElement('div');
      layout.className = 'weddings-amenities-layout';
      const intro = document.createElement('div');
      intro.className = 'weddings-amenities-intro';
      introBits.forEach((el) => intro.append(el));
      layout.append(intro);
      if (list) layout.append(list);
      wrapper.replaceChildren(layout);
    }
  }

  const culinarySection = main.querySelector('.section.split-reverse');
  if (culinarySection) {
    culinarySection.classList.add('weddings-culinary');
    const copy = culinarySection.querySelector('.split-copy')
      || culinarySection.querySelector('.default-content-wrapper')
      || culinarySection.querySelector(':scope > div:not(.section-metadata)');
    if (copy) {
      const h2 = copy.querySelector('h2');
      if (h2 && !copy.querySelector('.split-quote')) {
        const quote = document.createElement('blockquote');
        quote.className = 'split-quote';
        quote.textContent = '“A feast for the senses, crafted from the bounty of the bay.”';
        h2.insertAdjacentElement('afterend', quote);
      }
      const list = copy.querySelector('ul');
      if (list && !list.classList.contains('culinary-features')) {
        list.classList.add('culinary-features');
        list.querySelectorAll('li').forEach((li, index) => {
          li.classList.add('culinary-feature');
          const icon = document.createElement('i');
          icon.className = `culinary-feature-icon fa-solid ${CULINARY_FEATURE_ICONS[index] || 'fa-check'}`;
          icon.setAttribute('aria-hidden', 'true');
          const strong = li.querySelector('strong');
          if (strong) {
            const label = strong.textContent.replace(/:$/, '').trim();
            let descText = '';
            let afterStrong = false;
            li.childNodes.forEach((node) => {
              if (node === strong) {
                afterStrong = true;
                return;
              }
              if (afterStrong) descText += node.textContent || '';
            });
            descText = descText.replace(/^:\s*/, '').trim();
            const title = document.createElement('p');
            const titleStrong = document.createElement('strong');
            titleStrong.textContent = label;
            title.append(titleStrong);
            const desc = document.createElement('p');
            desc.textContent = descText;
            li.replaceChildren(icon, title, desc);
          } else {
            li.prepend(icon);
          }
        });
      }
    }
  }

  main.querySelectorAll('.section.highlight.centered').forEach((section) => {
    if (section.querySelector('table') && !section.classList.contains('weddings-planning')) {
      section.classList.add('weddings-planning');
      const table = section.querySelector('table');
      if (table && !table.parentElement?.classList.contains('weddings-table-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'weddings-table-wrap';
        table.parentElement?.insertBefore(wrap, table);
        wrap.append(table);
      }
    }
    if (section.querySelector('.button-container, .button') && section.querySelector('h2')?.textContent?.includes('Begin')) {
      section.classList.add('weddings-cta');
      const wrapper = section.querySelector('.default-content-wrapper')
        || section.querySelector(':scope > div:not(.section-metadata)');
      if (wrapper && !wrapper.querySelector('.weddings-cta-actions')) {
        const actions = document.createElement('div');
        actions.className = 'weddings-cta-actions';
        const button = wrapper.querySelector('.button-container');
        const galleryP = [...wrapper.querySelectorAll('p')].find((p) => p.querySelector('a[href*="Gallery"]'));
        const galleryLink = galleryP?.querySelector('a');
        if (button) actions.append(button);
        if (galleryLink) {
          galleryLink.classList.add('weddings-gallery-link');
          if (!galleryLink.querySelector('.fa-arrow-right')) {
            const arrow = document.createElement('i');
            arrow.className = 'fa-solid fa-arrow-right';
            arrow.setAttribute('aria-hidden', 'true');
            galleryLink.append(arrow);
          }
          galleryP.classList.remove('button-container');
          actions.append(galleryLink);
          galleryP.remove();
        }
        wrapper.append(actions);
      }
    }
  });
}

function getSectionWrapper(section) {
  return section.querySelector('.default-content-wrapper')
    || section.querySelector(':scope > div:not(.section-metadata)');
}

function sanitizeSectionHtml(html) {
  return html
    .replace(/<\/?motion\.div\b/gi, (tag) => tag.replace(/motion\./i, ''))
    .replace(/<\/[^>]*motion[^>]*>/gi, '</div>');
}

function ensureSectionCtaButton(container) {
  container?.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.classList.add('button');
    const parent = a.parentElement;
    if (parent?.tagName === 'P' || parent?.tagName === 'DIV') {
      parent.classList.add('button-container');
    }
  });
}

function findMediaNode(wrapper) {
  const imageP = [...wrapper.querySelectorAll('p')].find((p) => p.querySelector('picture, img'));
  if (imageP) return imageP;
  return [...wrapper.children].find((el) => el.querySelector('picture, img'));
}

/** UE wraps components in instrumented divs; published HTML is often flat. */
function getLayoutContentRoot(wrapper) {
  if (!wrapper) return wrapper;
  const { children } = wrapper;
  if (children.length === 1 && children[0].tagName === 'DIV') {
    const child = children[0];
    if (child.querySelector('h2, h3') && !child.matches('.split-grid, .bento-grid, .bento-mosaic-grid')) {
      return child;
    }
  }
  return wrapper;
}

function isMediaOnlyBranch(el) {
  if (!el?.querySelector) return false;
  if (!el.querySelector('picture, img')) return false;
  return !el.querySelector('h2, h3, h4, blockquote, ul, ol');
}

function unwrapBrokenSplitLayout(section) {
  const copy = section?.querySelector(':scope .split-copy');
  if (!copy || copy.childElementCount > 0) return;
  const grid = copy.closest('.split-grid');
  const wrapper = getSectionWrapper(section);
  if (!grid || !wrapper) return;
  const media = grid.querySelector('.split-media');
  [...media.children, ...copy.children].forEach((el) => wrapper.append(el));
  grid.remove();
}

function wrapSplit(section) {
  if (!section) return;
  if (section.querySelector('.split-grid')) {
    unwrapBrokenSplitLayout(section);
    if (section.querySelector('.split-grid')) return;
  }
  const wrapper = getSectionWrapper(section);
  if (!wrapper) return;
  const root = getLayoutContentRoot(wrapper);
  const h2 = root.querySelector('h2');
  const mediaEl = findMediaNode(root);
  if (!h2 || !mediaEl) return;

  const grid = document.createElement('div');
  grid.className = 'split-grid';
  const copy = document.createElement('div');
  copy.className = 'split-copy';
  const media = document.createElement('div');
  media.className = 'split-media';

  [...root.children].forEach((el) => {
    if (el === mediaEl || isMediaOnlyBranch(el)) media.append(el);
    else copy.append(el);
  });
  grid.append(copy, media);
  wrapper.replaceChildren(grid);
}

function wrapBento(section) {
  if (!section || section.querySelector('.bento-grid')) return;
  const wrapper = getSectionWrapper(section);
  if (!wrapper) return;
  const headings = [...wrapper.querySelectorAll('h3')];
  if (headings.length < 2) return;

  const grid = document.createElement('div');
  grid.className = 'bento-grid';
  const panel = document.createElement('div');
  panel.className = 'bento-panel';
  const aside = document.createElement('aside');
  aside.className = 'bento-aside';

  const [, asideH3] = headings;
  let node = headings[0];
  while (node && node !== asideH3) {
    const next = node.nextElementSibling;
    panel.append(node);
    node = next;
  }
  while (node) {
    const next = node.nextElementSibling;
    if (node.classList?.contains('section-metadata')) break;
    aside.append(node);
    node = next;
  }

  const images = document.createElement('div');
  images.className = 'bento-images';
  [...panel.querySelectorAll('p')].forEach((p) => {
    if (p.querySelector('picture, img')) images.append(p);
  });
  if (images.childElementCount) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'section-eyebrow';
    eyebrow.textContent = 'Spring Selection';
    panel.insertBefore(eyebrow, panel.firstChild);
    panel.append(images);
  }

  grid.append(panel, aside);
  wrapper.replaceChildren(grid);
}

function wrapSplitReverse(section) {
  if (!section) return;
  if (section.querySelector('.split-grid')) {
    unwrapBrokenSplitLayout(section);
    if (section.querySelector('.split-grid')) return;
  }
  const wrapper = getSectionWrapper(section);
  if (!wrapper) return;
  const root = getLayoutContentRoot(wrapper);
  if (!root.querySelector('h2')) return;

  const grid = document.createElement('div');
  grid.className = 'split-grid';
  const media = document.createElement('div');
  media.className = 'split-media';
  const copy = document.createElement('div');
  copy.className = 'split-copy';
  const features = document.createElement('div');
  features.className = 'split-features';

  const mediaEl = findMediaNode(root);
  [...root.children].forEach((el) => {
    if (el === mediaEl || isMediaOnlyBranch(el)) media.append(el);
  });

  const featureBlocks = [];
  [...root.children].filter((el) => el.tagName === 'H4').forEach((h4) => {
    const desc = h4.nextElementSibling;
    const block = document.createElement('div');
    block.append(h4);
    if (desc?.tagName === 'P' && !desc.querySelector('a')) block.append(desc);
    featureBlocks.push(block);
  });

  [...root.children].forEach((el) => {
    if (el === mediaEl || isMediaOnlyBranch(el)) return;
    if (el.tagName === 'H4') return;
    if (el.tagName === 'P' && el.previousElementSibling?.tagName === 'H4') return;
    copy.append(el);
  });
  if (featureBlocks.length) {
    featureBlocks.forEach((block) => features.append(block));
    const intro = copy.querySelector('p');
    if (intro) intro.after(features);
    else copy.prepend(features);
  }

  grid.append(media, copy);
  wrapper.replaceChildren(grid);
  ensureSectionCtaButton(copy);
}

function wrapBentoMosaic(section) {
  if (!section || section.querySelector('.bento-mosaic-grid')) return;
  const wrapper = getSectionWrapper(section);
  if (!wrapper) return;
  const h2 = wrapper.querySelector('h2');
  const h3s = [...wrapper.querySelectorAll('h3')];
  if (!h2 || h3s.length < 2) return;

  const header = document.createElement('div');
  header.className = 'bento-mosaic-header';
  header.append(h2);

  const grid = document.createElement('div');
  grid.className = 'bento-mosaic-grid';
  const tileClasses = ['bento-mosaic-tile', 'bento-mosaic-accent', 'bento-mosaic-bar'];

  h3s.forEach((h3, index) => {
    const tile = document.createElement('div');
    tile.className = tileClasses[index] || 'bento-mosaic-tile';
    let node = h3;
    while (node) {
      const next = node.nextElementSibling;
      tile.append(node);
      if (!next || next.tagName === 'H3' || next.classList?.contains('section-metadata')) break;
      node = next;
    }
    grid.append(tile);
  });

  wrapper.replaceChildren(header, grid);
}

function decorateNarrowList(section) {
  const list = section.querySelector('ul');
  if (!list || list.classList.contains('narrow-list')) return;
  list.classList.add('narrow-list');
  list.querySelectorAll('li').forEach((li) => {
    const strong = li.querySelector('strong');
    if (!strong || li.querySelector('span')) return;
    const label = strong.textContent;
    const times = li.textContent.replace(label, '').trim();
    li.replaceChildren();
    const span = document.createElement('span');
    span.textContent = times;
    li.append(strong, span);
  });
}

const LAYOUT_SECTIONS = '.section.split, .section.split-reverse, .section.bento, .section.bento-mosaic, .section.narrow, .section.wide';

/**
 * Sanitize authored markup and build layout wrappers for generic section styles.
 * @param {Element} main
 */
export function decorateSectionLayouts(main) {
  main.querySelectorAll(LAYOUT_SECTIONS).forEach((section) => {
    const wrapper = getSectionWrapper(section);
    if (wrapper && /motion\./i.test(wrapper.innerHTML)) {
      wrapper.innerHTML = sanitizeSectionHtml(wrapper.innerHTML);
    }
  });

  main.querySelectorAll('.section.split').forEach(wrapSplit);
  wrapBento(main.querySelector('.section.bento'));
  main.querySelectorAll('.section.bento-mosaic').forEach(wrapBentoMosaic);
  main.querySelectorAll('.section.split-reverse').forEach(wrapSplitReverse);
  main.querySelectorAll(
    '.section.split-reverse, .section.split, .section.narrow',
  ).forEach((section) => ensureSectionCtaButton(getSectionWrapper(section) || section));
  main.querySelectorAll('.section.narrow').forEach(decorateNarrowList);
}

/** @deprecated Use decorateSectionLayouts */
export const decorateDining = decorateSectionLayouts;

/** @deprecated Use decorateSectionLayouts */
export const decorateEvents = decorateSectionLayouts;

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    const { initFooterPreviewPage } = await import('../blocks/footer/footer.js');
    initFooterPreviewPage(main);
    document.body.classList.add('appear');
    const firstSection = main.querySelector('.footer-content .section, main > .section');
    await loadSection(firstSection, waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);
  if (main) {
    decorateFeatureGrid(main);
    decorateSectionLayouts(main);
    if (/\/weddings\/?$/.test(window.location.pathname)) {
      document.body.classList.add('weddings');
      loadCSS(`${window.hlx.codeBasePath}/styles/weddings.css`);
      decorateWeddings(main);
    }
  }

  const { initFooterPreviewPage, isFooterPage } = await import('../blocks/footer/footer.js');
  if (main) initFooterPreviewPage(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  if (!isFooterPage()) {
    loadFooter(doc.querySelector('footer'));
  } else {
    doc.querySelector('footer')?.remove();
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
