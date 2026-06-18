import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_SECTION_CLASSES = [
  'footer-contact',
  'footer-links',
  'footer-occasions',
  'footer-discover',
  'footer-bar',
];

const FOOTER_COLUMN_CLASSES = FOOTER_SECTION_CLASSES.slice(0, 4);

/**
 * True when a section is the Brand Concierge bc-section band.
 * @param {Element} section section element
 * @returns {boolean}
 */
function isBcSection(section) {
  return section.classList.contains('bc-section')
    || section.querySelector(':scope > .brandconcierge, :scope > .brandconcierge-wrapper');
}

/**
 * Moves the bc-section band above .footer-content (full footer width).
 * @param {Element} block footer block element
 * @param {Element} container .footer-content element
 */
function hoistBcSection(block, container) {
  if (block.querySelector(':scope > .bc-section')) return;

  const styledSection = container.querySelector(':scope > .section.bc-section, :scope > .bc-section');
  if (styledSection) {
    block.insertBefore(styledSection, container);
    return;
  }

  const bcBlock = container.querySelector(':scope > .section .brandconcierge');
  if (!bcBlock) return;

  const bcSection = document.createElement('div');
  bcSection.className = 'section bc-section';
  const blockRoot = bcBlock.closest('.brandconcierge-wrapper')
    || bcBlock.parentElement
    || bcBlock;
  bcSection.append(blockRoot);
  block.insertBefore(bcSection, container);

  const hostSection = bcBlock.closest('.section');
  if (hostSection?.parentElement === container && !hostSection.textContent.trim()) {
    hostSection.remove();
  }
}

/**
 * Groups the four link columns into a single grid row below bc-section.
 * @param {Element} container .footer-content element
 */
function wrapFooterColumns(container) {
  if (container.querySelector('.footer-columns')) return;

  const columns = FOOTER_COLUMN_CLASSES
    .map((cls) => container.querySelector(`:scope > .section.${cls}`))
    .filter(Boolean);
  if (!columns.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-columns';
  columns[0].before(wrapper);
  columns.forEach((column) => wrapper.append(column));
}

/**
 * Applies layout classes to footer sections (fragment page or embedded footer).
 * @param {Element} container Element containing .section children
 */
export function applyFooterSectionClasses(container) {
  const sections = [...container.querySelectorAll(':scope > .section:not(.bc-section)')];
  sections.slice(0, FOOTER_SECTION_CLASSES.length).forEach((section, i) => {
    section.classList.add(FOOTER_SECTION_CLASSES[i]);
    section.classList.remove('centered', 'wide', 'highlight', 'dark');
  });
  wrapFooterColumns(container);
}

/**
 * Builds newsletter field (AEM delivery strips div wrappers from fragment HTML).
 * @param {Element} section footer-contact section
 */
function decorateNewsletter(section) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  if (wrapper.querySelector('.footer-newsletter')) return;

  const marker = wrapper.querySelector('.footer-newsletter-marker');
  const privacy = wrapper.querySelector('.footer-privacy');
  const insertBefore = privacy || wrapper.querySelector('.footer-social');

  const newsletter = document.createElement('div');
  newsletter.className = 'footer-newsletter';
  newsletter.innerHTML = `
    <input type="email" placeholder="Your Email Address" aria-label="Your Email Address" />
    <a href="#" class="footer-newsletter-submit" aria-label="Subscribe">
      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    </a>`;

  if (marker) {
    marker.replaceWith(newsletter);
  } else if (insertBefore) {
    insertBefore.before(newsletter);
  } else {
    const desc = wrapper.querySelector('p');
    if (desc?.nextElementSibling) {
      desc.nextElementSibling.after(newsletter);
    } else {
      wrapper.append(newsletter);
    }
  }
}

/**
 * Ensures social links have visible icons.
 * @param {Element} section footer-contact section
 */
function decorateSocial(section) {
  const social = section.querySelector('.footer-social');
  if (!social) return;

  const icons = ['fa-regular fa-comment', 'fa-solid fa-camera', 'fa-solid fa-globe'];
  const labels = ['Message', 'Instagram', 'Website'];
  const links = [...social.querySelectorAll('a')];

  links.forEach((link, i) => {
    if (!link.textContent.trim() && icons[i]) {
      link.setAttribute('aria-label', labels[i]);
      link.innerHTML = `<i class="${icons[i]}" aria-hidden="true"></i>`;
    }
  });
}

/**
 * Wraps location and phone blocks into mock-style contact bar.
 * @param {Element} section footer-bar section
 */
function decorateContactBar(section) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  if (wrapper.querySelector('.footer-bar-inner')) return;

  const location = wrapper.querySelector('.footer-bar-location');
  const contact = wrapper.querySelector('.footer-bar-contact');
  if (!location || !contact) return;

  const inner = document.createElement('div');
  inner.className = 'footer-bar-inner';

  const locationWrap = document.createElement('div');
  locationWrap.className = 'footer-bar-location';
  const locationP = location.cloneNode(true);
  if (!locationP.querySelector('i')) {
    locationP.innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${locationP.innerHTML}`;
  }
  locationWrap.append(locationP);

  const contactWrap = document.createElement('div');
  contactWrap.className = 'footer-bar-contact';
  const contactP = contact.cloneNode(true);
  if (!contactP.querySelector('i')) {
    contactP.innerHTML = `<i class="fa-solid fa-phone" aria-hidden="true"></i> ${contactP.innerHTML}`;
  }
  contactWrap.append(contactP);

  inner.append(locationWrap, contactWrap);
  location.remove();
  contact.remove();
  wrapper.prepend(inner);
}

/**
 * Post-processes footer fragment markup for mock layout.
 * @param {Element} container footer-content element
 */
export function decorateFooterContent(container) {
  const contact = container.querySelector('.footer-contact');
  const bar = container.querySelector('.footer-bar');

  if (contact) {
    decorateNewsletter(contact);
    decorateSocial(contact);
  }
  if (bar) decorateContactBar(bar);
}

/**
 * True when viewing the footer fragment page (local, edge, or AEM author path).
 * @returns {boolean}
 */
export function isFooterPage() {
  const { pathname } = window.location;
  return /\/footer(\.html)?(\/|$)/i.test(pathname);
}

/**
 * Prepares the standalone footer page in AEM Author / local preview.
 * Wraps sections in .footer-content so the same CSS applies as on the live site.
 * @param {Element} main page main element
 */
export function initFooterPreviewPage(main) {
  if (!main || !isFooterPage()) return;

  main.classList.add('footer-page');
  document.body.classList.add('footer-page');

  let container = main.querySelector(':scope > .footer-content');
  if (!container) {
    container = document.createElement('div');
    container.className = 'footer-content';
    const children = [...main.children];
    children.forEach((child) => {
      if (isBcSection(child)) main.append(child);
      else container.append(child);
    });
    main.append(container);
  }

  container.querySelectorAll('.section').forEach((section) => {
    section.style.removeProperty('display');
  });

  hoistBcSection(main, container);
  applyFooterSectionClasses(container);
  decorateFooterContent(container);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footerContent = document.createElement('div');
  footerContent.className = 'footer-content';
  while (fragment.firstElementChild) {
    const child = fragment.firstElementChild;
    if (isBcSection(child)) {
      block.append(child);
      continue;
    }
    footerContent.append(child);
  }

  footerContent.querySelectorAll('.section').forEach((section) => {
    section.style.removeProperty('display');
  });

  hoistBcSection(block, footerContent);
  applyFooterSectionClasses(footerContent);
  decorateFooterContent(footerContent);

  block.append(footerContent);
}
