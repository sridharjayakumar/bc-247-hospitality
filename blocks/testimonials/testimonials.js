export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const list = document.createElement('div');
  list.className = 'testimonials-list';

  rows.forEach((row) => {
    const cols = [...row.children];
    const item = document.createElement('blockquote');
    item.className = 'testimonial-item';

    if (cols[0]) {
      const quote = document.createElement('p');
      quote.className = 'testimonial-quote';
      quote.innerHTML = cols[0].innerHTML;
      item.append(quote);
    }

    if (cols[1]) {
      const author = document.createElement('cite');
      author.className = 'testimonial-author';
      author.textContent = cols[1].textContent;
      item.append(author);
    }

    list.append(item);
  });

  block.append(list);
}
