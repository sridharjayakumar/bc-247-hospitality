import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function decorateGalleryCard(body) {
  const link = body.querySelector('a');
  if (link) link.classList.add('cards-card-cta');
  const eyebrow = body.querySelector('.cards-eyebrow');
  if (eyebrow) eyebrow.closest('p')?.classList.add('cards-card-eyebrow');
  const title = body.querySelector('strong');
  if (title) (title.closest('p') || body).classList.add('cards-card-title');
}

export default function decorate(block) {
  const isWide = block.closest('.section')?.classList.contains('wide');
  if (isWide) block.classList.add('gallery');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((motion) => {
      if (motion.children.length === 1 && motion.querySelector('picture')) motion.className = 'cards-card-image';
      else {
        motion.className = 'cards-card-body';
        if (isWide) decorateGalleryCard(motion);
      }
    });
    ul.append(li);
  });
  const imgWidth = isWide ? '1200' : '750';
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: imgWidth }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
