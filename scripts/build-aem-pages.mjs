#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'content', 'aem');
const DAM = '/content/dam/luma-hotels';

function page(props, sections) {
  const rootItems = {};
  sections.forEach((sec, i) => {
    const key = `0:${i}`;
    rootItems[key] = {
      'capi-key': key,
      'capi-index': i,
      id: sec.id || `section_${i}`,
      componentType: 'core/franklin/components/section/v1/section',
      properties: sec.style ? { style: sec.style } : {},
      items: sec.children,
    };
  });
  return {
    id: 'jcr:content',
    componentType: 'core/franklin/components/page/v1/page',
    properties: {
      pageTitle: props.pageTitle,
      'jcr:title': props.jcrTitle,
      'cq:template': '/libs/core/franklin/templates/page',
    },
    items: {
      0: {
        'capi-key': '0',
        'capi-index': 0,
        id: 'root',
        componentType: 'core/franklin/components/root/v1/root',
        properties: {},
        items: rootItems,
      },
    },
  };
}

function child(key, index, id, type, properties, items = {}) {
  return {
    'capi-key': key,
    'capi-index': index,
    id,
    componentType: type,
    properties,
    items,
  };
}

function heroBlock(key, index, id, image, imageAlt, h1, subtitle) {
  return child(key, index, id, 'core/franklin/components/block/v1/block', {
    name: 'Hero',
    model: 'hero',
    filter: 'hero',
    image: `${DAM}/${image}`,
    imageAlt,
    text: `<h1>${h1}</h1><p>${subtitle}</p>`,
  });
}

function title(key, index, id, titleType, title) {
  return child(key, index, id, 'core/franklin/components/title/v1/title', { titleType, title });
}

function text(key, index, id, html) {
  return child(key, index, id, 'core/franklin/components/text/v1/text', { text: html });
}

function cardsBlock(key, index, id, cardItems) {
  const items = {};
  cardItems.forEach((c, i) => {
    const ck = `${key}:${i}`;
    items[ck] = child(ck, i, `card_${i}`, 'core/franklin/components/block/v1/block/item', {
      name: 'Card',
      model: 'card',
      image: `${DAM}/${c.image}`,
      text: c.text,
    });
  });
  return child(key, index, id, 'core/franklin/components/block/v1/block', {
    filter: 'cards',
    name: 'Cards',
    model: 'cards',
  }, items);
}

const events = page(
  { pageTitle: 'Meetings & Events', jcrTitle: 'Meetings & Events' },
  [
    {
      id: 'section_hero',
      style: 'hero',
      children: {
        '0:0:0': heroBlock(
          '0:0:0', 0, 'hero_events',
          'meetings.jpeg',
          'Meetings and events at Albergo Pacifica',
          'Meetings &amp; Events',
          'Over 20,000 square feet of indoor and outdoor venues for conferences, retreats, and celebrations',
        ),
      },
    },
    {
      id: 'section_intro',
      style: 'centered',
      children: {
        '0:1:0': title('0:1:0', 0, 'title_intro', 'h2', 'Inspiring Spaces on the Bay'),
        '0:1:1': text('0:1:1', 1, 'text_intro', '<p>From executive boardrooms to waterfront terraces, Albergo Pacifica offers versatile venues backed by dedicated event professionals, estate catering, and technology that keeps your program running flawlessly.</p>'),
      },
    },
    {
      id: 'section_venues',
      style: 'wide',
      children: {
        '0:2:0': cardsBlock('0:2:0', 0, 'venues_cards', [
          {
            image: 'meetings.jpeg',
            text: '<p><span class="cards-eyebrow">Signature Venue</span></p><p><strong>Pacific Ballroom</strong></p><p>12,000 sq ft ballroom with bay views, built-in AV, and breakout salons. Ideal for galas and conferences up to 350 guests.</p>',
          },
          {
            image: 'estate-grounds.jpeg',
            text: '<p><strong>Bay View Terrace</strong></p><p>Open-air reception space overlooking the estate gardens and San Francisco Bay. Perfect for cocktail receptions and sunset dinners.</p>',
          },
          {
            image: 'estate-grounds.jpeg',
            text: '<p><strong>Garden Pavilion</strong></p><p>Intimate tented pavilion surrounded by olive groves and lavender paths. Seats up to 120 for weddings and private celebrations.</p>',
          },
          {
            image: 'meetings.jpeg',
            text: '<p><strong>Executive Boardroom</strong></p><p>Private boardroom with video conferencing, white-glove service, and chef-curated working lunches for up to 24 executives.</p>',
          },
        ]),
      },
    },
    {
      id: 'section_amenities',
      style: 'feature-grid',
      children: {
        '0:3:0': title('0:3:0', 0, 'title_amenities', 'h2', 'Event Services &amp; Amenities'),
        '0:3:1': text('0:3:1', 1, 'text_amenities', `<p>Our events team handles every detail so you can focus on your guests and your message.</p>
<ul>
 <li>av<h4>AV &amp; Technology</h4>State-of-the-art sound, lighting, and hybrid streaming support.</li>
 <li>catering<h4>Estate Catering</h4>Pacific Table menus tailored to your program and dietary needs.</li>
 <li>wifi<h4>High-Speed Wi-Fi</h4>Dedicated bandwidth for conferences and live presentations.</li>
 <li>concierge<h4>Event Concierge</h4>On-site coordinators from planning through breakdown.</li>
 <li>parking<h4>Valet &amp; Parking</h4>Complimentary valet for groups of 25 or more.</li>
 <li>bed<h4>Guest Room Blocks</h4>Preferential rates and suites for VIP attendees.</li>
</ul>`),
      },
    },
    {
      id: 'section_cta',
      style: 'dark centered',
      children: {
        '0:4:0': title('0:4:0', 0, 'title_cta', 'h2', 'Plan Your Next Event'),
        '0:4:1': text('0:4:1', 1, 'text_cta', '<p>Tell us about your vision — our sales team will craft a proposal tailored to your dates, guest count, and culinary preferences.</p><p><a href="mailto:sales@albergopacifica.com">Contact Sales</a></p>'),
      },
    },
  ],
);

const wellness = page(
  { pageTitle: 'Wellness & Spa', jcrTitle: 'Wellness & Spa' },
  [
    {
      id: 'section_hero',
      style: 'hero',
      children: {
        '0:0:0': heroBlock(
          '0:0:0', 0, 'hero_wellness',
          'hotel-spa-wellness.jpeg',
          'Wellness and spa at Albergo Pacifica',
          'Wellness &amp; Spa',
          'Restore body and spirit in our bay-view sanctuary',
        ),
      },
    },
    {
      id: 'section_intro',
      style: 'centered',
      children: {
        '0:1:0': title('0:1:0', 0, 'title_intro', 'h2', 'A Sanctuary for Restoration'),
        '0:1:1': text('0:1:1', 1, 'text_intro', '<p>Step into a world of calm where coastal breezes, organic botanicals, and expert therapists guide you back to balance. Our wellness pavilion blends ancient rituals with modern science on the edge of the Pacific.</p>'),
      },
    },
    {
      id: 'section_services',
      style: 'feature-grid',
      children: {
        '0:2:0': title('0:2:0', 0, 'title_services', 'h2', 'Spa Services'),
        '0:2:1': text('0:2:1', 1, 'text_services', `<ul>
 <li>spa<h4>Signature Massage</h4>90-minute coastal stone therapy with aromatherapy oils.</li>
 <li>pool<h4>Hydrotherapy Circuit</h4>Heated pools, eucalyptus steam, and cold plunge overlooking the bay.</li>
 <li>yoga<h4>Sunrise Yoga</h4>Daily sessions on the terrace with certified instructors.</li>
 <li>facial<h4>Organic Facials</h4>Custom treatments using California botanicals and marine extracts.</li>
 <li>nightlight<h4>Sleep Rituals</h4>Evening turndown with herbal tea and guided meditation.</li>
 <li>fitness<h4>Fitness Studio</h4>Peloton, strength training, and personal coaching by appointment.</li>
</ul>`),
      },
    },
    {
      id: 'section_dining',
      style: 'centered',
      children: {
        '0:3:0': title('0:3:0', 0, 'title_dining', 'h2', 'Nourish &amp; Renew'),
        '0:3:1': text('0:3:1', 1, 'text_dining', '<p>Complement your wellness journey with light, seasonal fare at <a href="/dining" title="Pacific Table Restaurant">Pacific Table Restaurant</a> — farm-fresh ingredients and restorative menus designed for vitality.</p>'),
      },
    },
    {
      id: 'section_packages',
      style: 'centered',
      children: {
        '0:4:0': title('0:4:0', 0, 'title_packages', 'h2', 'Wellness Packages'),
        '0:4:1': text('0:4:1', 1, 'text_packages', '<p>Book a half-day escape or a full weekend retreat. Packages include spa credits, yoga classes, and healthy dining credits at Pacific Table.</p><p><a href="mailto:reservations@albergopacifica.com">Reserve Your Experience</a></p>'),
      },
    },
  ],
);

const weddings = page(
  { pageTitle: 'Weddings', jcrTitle: 'Weddings at Albergo Pacifica' },
  [
    {
      id: 'section_hero',
      style: 'hero',
      children: {
        '0:0:0': child('0:0:0', 0, 'hero_weddings', 'core/franklin/components/block/v1/block', {
          name: 'Hero',
          model: 'hero',
          filter: 'hero',
          image: `${DAM}/hotel-wedding.jpeg`,
          imageAlt: 'Wedding ceremony at Albergo Pacifica',
          text: '<h1>Weddings at Albergo Pacifica</h1><p>Legendary celebrations where the bay meets timeless elegance</p><p><a href="mailto:weddings@albergopacifica.com">Wedding Inquiries</a> <a href="mailto:events@albergopacifica.com">Events Team</a></p>',
        }),
      },
    },
    {
      id: 'section_intro',
      style: 'centered',
      children: {
        '0:1:0': title('0:1:0', 0, 'title_intro', 'h2', 'Your Day, Perfectly Composed'),
        '0:1:1': text('0:1:1', 1, 'text_intro', '<p>From the first toast to the last dance, our wedding specialists orchestrate every moment across 15 acres of gardens, terraces, and grand ballrooms overlooking the San Francisco Bay.</p>'),
      },
    },
    {
      id: 'section_venues',
      style: 'wide',
      children: {
        '0:2:0': cardsBlock('0:2:0', 0, 'venue_cards', [
          {
            image: 'hotel-wedding.jpeg',
            text: '<p><strong>Grand Ballroom</strong></p><p>Crystal chandeliers, marble floors, and floor-to-ceiling windows framing the bay. The pinnacle of indoor elegance.</p><p><a href="mailto:weddings@albergopacifica.com">Up to 250 guests — inquire</a></p>',
          },
          {
            image: 'estate-grounds.jpeg',
            text: '<p><strong>Coastal Terrace</strong></p><p>Al fresco ceremonies at golden hour with the bay as your backdrop and estate gardens all around.</p><p><a href="mailto:events@albergopacifica.com">Up to 180 guests — inquire</a></p>',
          },
        ]),
      },
    },
    {
      id: 'section_amenities',
      style: 'feature-grid',
      children: {
        '0:3:0': title('0:3:0', 0, 'title_amenities', 'h2', 'Every Detail, Considered'),
        '0:3:1': text('0:3:1', 1, 'text_amenities', '<p>Our dedicated wedding team ensures your celebration unfolds seamlessly from rehearsal to farewell brunch.</p><ul><li>ring<h4>Full Planning</h4>Dedicated coordinator from engagement party through send-off.</li><li>camera<h4>Preferred Vendors</h4>Curated photographers, florists, and entertainment with estate access.</li><li>champagne<h4>Champagne Toast</h4>Bay-view cocktail hour with estate sparkling and canapés.</li><li>bed<h4>Bridal Suite</h4>Complimentary night in our Presidential Suite for the couple.</li><li>music<h4>Live Music</h4>Grand piano in the ballroom and terrace sound systems.</li><li>car<h4>Valet &amp; Transport</h4>Complimentary guest valet and shuttle coordination.</li></ul>'),
      },
    },
    {
      id: 'section_culinary',
      style: 'split-reverse',
      children: {
        '0:4:0': text('0:4:0', 0, 'text_culinary_img', `<p><img src="${DAM}/restaurant.jpeg" alt="Pacific Table culinary team"></p>`),
        '0:4:1': title('0:4:1', 1, 'title_culinary', 'h2', 'Culinary Artistry'),
        '0:4:2': text('0:4:2', 2, 'text_culinary_intro', '<p>Executive Chef Maria Santos and the Pacific Table team create bespoke menus that celebrate Northern California terroir — from passed hors d\'oeuvres to multi-course plated dinners.</p>'),
        '0:4:3': text('0:4:3', 3, 'text_culinary_features', '<ul><li><strong>Farm-to-Table:</strong> Seasonal ingredients sourced from estate gardens and local farms.</li><li><strong>Wine Pairings:</strong> Sommelier-curated Napa and Sonoma selections for every course.</li><li><strong>Custom Cakes:</strong> In-house pastry team crafting your vision in sugar and gold.</li><li><strong>Dietary Excellence:</strong> Thoughtful vegan, gluten-free, and allergen-aware menus.</li></ul>'),
      },
    },
    {
      id: 'section_packages',
      style: 'highlight centered',
      children: {
        '0:5:0': title('0:5:0', 0, 'title_packages', 'h2', 'Wedding Packages'),
        '0:5:1': text('0:5:1', 1, 'text_packages_table', `<table>
<thead><tr><th>Package</th><th>Includes</th><th>Starting</th></tr></thead>
<tbody>
<tr><td>Garden Romance</td><td>Terrace ceremony, cocktail hour, reception for up to 80 guests</td><td>$18,500</td></tr>
<tr><td>Bay View Classic</td><td>Ballroom ceremony &amp; reception, premium bar, bridal suite</td><td>$32,000</td></tr>
<tr><td>Estate Grand</td><td>Full estate buyout, multi-venue celebration, butler service</td><td>Custom</td></tr>
</tbody>
</table>
<p>All packages include event coordination, estate tables and linens, and a tasting for two at Pacific Table.</p>`),
      },
    },
    {
      id: 'section_cta',
      style: 'dark centered',
      children: {
        '0:6:0': title('0:6:0', 0, 'title_cta', 'h2', 'Begin Planning Your Celebration'),
        '0:6:1': text('0:6:1', 1, 'text_cta', '<p>Schedule a private tour of our venues and meet your dedicated wedding coordinator.</p><p><a href="mailto:weddings@albergopacifica.com">Schedule a Consultation</a></p>'),
      },
    },
  ],
);

for (const [name, data] of [['events', events], ['wellness', wellness], ['weddings', weddings]]) {
  const path = join(outDir, `${name}.json`);
  writeFileSync(path, `${JSON.stringify(data)}\n`);
  console.log(`Wrote ${path}`);
}
