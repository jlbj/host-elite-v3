import type { SavedTemplate } from '../models/paving.types';

const defaultIcons = {
  pool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 2v10"/><path d="M8 6h8"/></svg>',
  spa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-2 2-4 4-4s4 2 4 4"/><path d="M12 12c0-2 2-4 4-4s4 2 4 4"/><path d="M4 20c0-2 2-4 4-4"/><path d="M16 16c2 0 4 2 4 4"/></svg>',
  cinema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M9 8v8l6-4z"/></svg>',
  wine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v12"/><path d="M8 14h8v8H8z"/><path d="M6 10c0-3 2-5 6-5s6 2 6 5"/></svg>',
  gym: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l4 4"/><path d="M14 14l4 4"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>',
  ac: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v10"/><path d="M4 12h16"/><path d="M7 7l5 5 5-5"/><path d="M7 17l5-5 5 5"/></svg>',
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>'
};

const defaultAmenities = [
  { name: 'Heated Swimming Pool', icon: defaultIcons.pool },
  { name: 'Spa, Hammam & Sauna', icon: defaultIcons.spa },
  { name: 'Private Cinema Room', icon: defaultIcons.cinema },
  { name: 'Cigar Room & Bar', icon: defaultIcons.wine },
  { name: 'Fitness Room', icon: defaultIcons.gym },
  { name: 'Air Conditioning', icon: defaultIcons.ac }
];

const defaultAmenitiesHtml = defaultAmenities.map(am => 
  `<div class="luxury-amenity-item"><span class="luxury-amenity-icon">${am.icon}</span><span>${am.name}</span></div>`
).join('\n');

const defaultGalleryPhotos = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80'
];

const defaultGalleryHtml = `
<div class="luxury-gallery-container" data-gallery-type="lookbook">
  <div class="gallery-lookbook">
    ${defaultGalleryPhotos.map((url, i) => `<div class="lookbook-item"><div class="lookbook-image-wrapper"><img src="${url}" alt="Photo ${i + 1}" /></div></div>`).join('\n')}
  </div>
</div>`;

export const PREDEFINED_TEMPLATES: SavedTemplate[] = [
  {
    id: 'le-collectionist',
    name: 'Le Collectionist Luxury Style',
    description: 'Sleek luxury design featuring Sora and Playfair Display typography, structured highlights bar, and editorial narrative style.',
    media: 'https://cdn.lecollectionist.com/__lecollectionist__/production/houses/8076/photos/IgJA7syOTbGe4kyvXl9b_72f6f733-d7a7-4ada-d93a-804ae9fd4375.jpg?q=50&width=600',
    css: `
      .luxury-template { font-family: 'Sora', sans-serif; color: #202020; background-color: #ffffff; line-height: 1.6; }
      .luxury-serif { font-family: 'Playfair Display', serif; }
      .luxury-hero { position: relative; height: 75vh; background-image: url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 60px 4%; }
      .luxury-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)); }
      .luxury-hero-content { position: relative; z-index: 10; color: #ffffff; }
      .luxury-hero-title { font-size: 3.5rem; font-weight: 400; margin: 0 0 10px; letter-spacing: -0.02em; }
      .luxury-hero-subtitle { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.9; }
      .luxury-bar { border-bottom: 1px solid #eaeaea; padding: 24px 4%; display: flex; gap: 40px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; color: #757575; background: #fafafa; }
      .luxury-bar span strong { color: #202020; }
      .luxury-container { max-width: 1200px; margin: 60px auto; padding: 0 4%; display: grid; grid-template-columns: 1.6fr 1fr; gap: 60px; }
      @media(max-width: 992px) { .luxury-container { grid-template-columns: 1fr; gap: 40px; } }
      .luxury-story-title { font-size: 2rem; font-weight: 400; margin: 0 0 24px; line-height: 1.3; }
      .luxury-story-text { font-size: 1.05rem; color: #4c4c4c; margin-bottom: 30px; line-height: 1.7; }
      .luxury-booking-card { border: 1px solid #eaeaea; border-radius: 4px; padding: 32px; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); background: #ffffff; }
      .luxury-price-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #757575; }
      .luxury-price { font-size: 1.8rem; font-weight: 500; color: #202020; margin: 4px 0 24px; }
      .luxury-btn { width: 100%; padding: 16px; background-color: #202020; color: #ffffff; border: none; border-radius: 2px; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background-color 0.2s; }
      .luxury-btn:hover { background-color: #000000; }
      .luxury-amenities-section { border-top: 1px solid #eaeaea; padding-top: 40px; margin-top: 40px; }
      .luxury-section-title { font-size: 1.4rem; font-weight: 400; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em; }
      .luxury-amenities-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px 40px; }
      .luxury-amenity-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: #4c4c4c; }
      .luxury-amenity-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; color: #202020; }
      .luxury-amenity-icon svg { width: 100%; height: 100%; }
      .luxury-gallery { max-width: 1200px; margin: 80px auto; padding: 0 4%; }
      .lookbook-image-wrapper { overflow: hidden; position: relative; background-color: #f5f2eb; aspect-ratio: 16/10; }
      .lookbook-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    `,
    html: `
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
      <div class="luxury-template">
        <div class="luxury-hero">
          <div class="luxury-hero-content">
            <span class="luxury-hero-subtitle">Exclusive Rental</span>
            <h1 class="luxury-hero-title luxury-serif">Villa Serenity</h1>
            <span class="luxury-hero-subtitle">Amalfi Coast, Italy</span>
          </div>
        </div>
        <div class="luxury-bar">
          <span>Guests <strong>12</strong></span>
          <span>Bedrooms <strong>6</strong></span>
          <span>Bathrooms <strong>6</strong></span>
          <span>Pool <strong>Heated</strong></span>
          <span>Spa & Hamam <strong>Yes</strong></span>
        </div>
        <div class="luxury-container">
          <div>
            <h2 class="luxury-story-title luxury-serif">A luxury retreat built with exceptional refinement.</h2>
            <div class="luxury-story-text">This prestigious property blends refined luxury with serene surroundings. Nestled on a coastal hillside, the estate offers complete privacy, scenic panoramas, and customized concierge services.</div>
            <div class="luxury-amenities-section">
              <h3 class="luxury-section-title luxury-serif">Premium Amenities</h3>
              <div class="luxury-amenities-grid">
                ${defaultAmenitiesHtml}
              </div>
            </div>
          </div>
          <div>
            <div class="luxury-booking-card">
              <div class="luxury-price-label">Weekly Price From</div>
              <div class="luxury-price">€62,515 <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ week</span></div>
              <button class="luxury-btn">Inquire About Stay</button>
              <div style="margin-top: 20px; font-size: 0.8rem; color: #757575; text-align: center;">Concierge Services & In-House Staff Included</div>
            </div>
          </div>
        </div>
        <div class="luxury-gallery">
          <h3 class="luxury-section-title luxury-serif" style="margin-bottom:32px;">The Property Gallery</h3>
          ${defaultGalleryHtml}
        </div>
      </div>
    `,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'villa-serenity',
    name: 'Villa Serenity — Amalfi Luxury',
    description: 'Mediterranean themed template with a fixed full-screen cover layout, custom navbar, clean stats cards, and immersive full-bleed sections.',
    media: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    css: `
      :root {
        --bg: #f7f5f0;
        --fg: #1e2a35;
        --primary: #1a6b73;
        --primary-fg: #fff;
        --muted-fg: #6b7a85;
        --accent: #c9975b;
        --border: #d9d2c7;
        --sans: 'Inter', system-ui, sans-serif;
        --serif: 'Playfair Display', Georgia, serif;
        --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
        --shadow-xl: 0 20px 50px rgba(0,0,0,0.15);
      }
      .serenity-body { font-family: var(--sans); background: var(--bg); color: var(--fg); line-height: 1.6; }
      .serenity-serif { font-family: var(--serif); }
      .serenity-navbar { position: sticky; top: 0; z-index: 100; padding: 1.25rem 2rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; }
      .serenity-brand { font-family: var(--serif); font-size: 1.25rem; font-weight: bold; color: var(--fg); }
      .serenity-hero { position: relative; height: 80vh; display: flex; align-items: center; justify-content: center; overflow: hidden; background-image: url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'); background-size: cover; background-position: center; }
      .serenity-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
      .serenity-hero-content { position: relative; z-index: 10; text-align: center; color: white; padding: 0 1rem; }
      .serenity-hero-title { font-size: 3.5rem; margin-bottom: 1rem; }
      .serenity-hero-subtitle { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.9; }
      .serenity-section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; }
      .serenity-tag { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--primary); font-weight: bold; margin-bottom: 0.5rem; }
      .serenity-title { font-size: 2.25rem; margin-bottom: 1.5rem; }
      .serenity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
      @media(max-width: 768px) { .serenity-grid { grid-template-columns: 1fr; } }
      .serenity-desc { color: var(--muted-fg); font-size: 1.05rem; line-height: 1.8; }
      .serenity-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2rem; }
      .serenity-stat { text-align: center; padding: 1rem; background: white; border-radius: 12px; border: 1px solid var(--border); }
      .serenity-stat-val { font-family: var(--serif); font-size: 1.5rem; font-weight: bold; color: var(--primary); }
      .serenity-stat-lbl { font-size: 0.8rem; color: var(--muted-fg); }
      .serenity-amenity-icon svg { width: 24px; height: 24px; color: var(--primary); }
    `,
    html: `
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
      <div class="serenity-body">
        <header class="serenity-navbar">
          <span class="serenity-brand">Villa Serenity</span>
          <span class="serenity-tag" style="margin-bottom: 0;">Amalfi Coast</span>
        </header>
        <section class="serenity-hero">
          <div class="serenity-overlay"></div>
          <div class="serenity-hero-content">
            <p class="serenity-hero-subtitle">Exclusive Amalfi Coast Retreat</p>
            <h1 class="serenity-hero-title serenity-serif">Villa Serenity</h1>
          </div>
        </section>
        <section class="serenity-section">
          <div class="serenity-grid">
            <div>
              <p class="serenity-tag">The Villa</p>
              <h2 class="serenity-title serenity-serif">Where coastal charm meets modern refinement</h2>
              <p class="serenity-desc">A beautiful Mediterranean sanctuary featuring panoramic sea views, a swimming pool, and pristine gardens. Perfectly designed for guest relaxation and coastal exploration.</p>
              <div class="serenity-stats">
                <div class="serenity-stat"><span class="serenity-stat-val">6</span><div class="serenity-stat-lbl">Bedrooms</div></div>
                <div class="serenity-stat"><span class="serenity-stat-val">6</span><div class="serenity-stat-lbl">Bathrooms</div></div>
                <div class="serenity-stat"><span class="serenity-stat-val">12</span><div class="serenity-stat-lbl">Guests</div></div>
              </div>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=800&q=80" alt="Villa Interior" style="width:100%; border-radius:16px; box-shadow:var(--shadow-lg);" />
            </div>
          </div>
        </section>
      </div>
    `,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
