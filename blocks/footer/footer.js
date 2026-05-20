import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_SECTION_CLASSES = ['footer-contact', 'footer-links', 'footer-visit', 'footer-copyright'];

/**
 * Applies layout classes to footer sections (fragment page or embedded footer).
 * @param {Element} container Element containing .section children
 */
export function applyFooterSectionClasses(container) {
  const sections = [...container.querySelectorAll(':scope > .section')];
  sections.slice(0, FOOTER_SECTION_CLASSES.length).forEach((section, i) => {
    section.classList.add(FOOTER_SECTION_CLASSES[i]);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footerContent = document.createElement('div');
  footerContent.className = 'footer-content';
  while (fragment.firstElementChild) footerContent.append(fragment.firstElementChild);

  applyFooterSectionClasses(footerContent);

  block.append(footerContent);
}
