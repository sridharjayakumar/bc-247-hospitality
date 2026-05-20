import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Franklin hero block: row 1 = image, row 2 = text (richtext).
 * @param {Element} block
 */
export default function decorate(block) {
  if (!block.children.length) return;

  const inner = document.createElement('div');
  inner.className = 'hero';

  [...block.children].forEach((row) => {
    const slot = document.createElement('div');
    moveInstrumentation(row, slot);
    while (row.firstElementChild) slot.append(row.firstElementChild);
    inner.append(slot);
    row.remove();
  });

  block.replaceChildren(inner);

  const img = block.querySelector('picture img');
  if (img) {
    const pic = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  }
}
