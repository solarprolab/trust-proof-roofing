export const SITE = {
  name: 'Trust Proof Roofing',
  tagline: 'Roofing You Can Trust — Backed by Proof',
  description: "Connecticut's trusted roofing contractor. Licensed, insured, and committed to quality. Roof replacement, repair, inspection, and emergency services across CT.",
  url: 'https://trustproofroofing.com',
  phone: '(959) 333-8569',
  email: 'info@trustproofroofing.com',
  address: {
    street: '',
    city: 'Suffield',
    state: 'CT',
    stateFullName: 'Connecticut',
    zip: '06078',
  },
  social: {
    facebook: '',
    instagram: '',
    google: '',
    yelp: '',
  },
  license: 'HIC.0703927',
  insurance: '',
  founded: '2024',
  owner: 'Tenzin',
};

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  features: string[];
  faq: { q: string; a: string }[];
}

export const SERVICES: Service[] = [
  {
    slug: 'roof-replacement',
    name: 'Roof Replacement',
    shortName: 'Replacement',
    description: 'Complete roof replacement using premium materials. GAF & Owens Corning certified installer with 10-year workmanship warranty and manufacturer warranties up to 50 years.',
    metaTitle: 'Roof Replacement Connecticut | Trust Proof Roofing',
    metaDescription: 'Complete roof replacement in CT. GAF & Owens Corning certified. 10-year workmanship warranty, manufacturer warranties up to 50 years. Free estimate.',
    icon: '🏠',
    features: [
      'GAF & Owens Corning certified installer',
      '10-year workmanship warranty',
      'Manufacturer warranties up to 50 years',
      'Full tear-off and disposal included',
      'Ice & water shield in all valleys',
      'Detailed written estimate before work begins',
    ],
    faq: [
      {
        q: 'How much does a roof replacement cost in Connecticut?',
        a: 'Most CT homeowners pay between $8,000 and $25,000 for a full roof replacement, depending on roof size, pitch, material choice, and the complexity of the job. We provide free, detailed written estimates so you know exactly what to expect before signing anything.',
      },
      {
        q: 'How long does a roof replacement take?',
        a: 'Most residential roof replacements in Connecticut take 1 to 3 days. Larger or more complex roofs with steep pitches, multiple dormers, or premium materials like slate may take longer. We give you a timeline upfront and stick to it.',
      },
      {
        q: 'What roofing materials work best in Connecticut?',
        a: "Architectural asphalt shingles are the most popular choice in CT due to their durability in freeze-thaw cycles and cost-effectiveness. Impact-resistant shingles are great for storm-prone areas. Metal roofing is an excellent long-term investment. We'll recommend the best option for your home and budget.",
      },
      {
        q: 'Do I need a permit for a roof replacement in CT?',
        a: 'Yes, most Connecticut municipalities require a building permit for full roof replacements. We handle the permit process for you as part of our service. We are fully licensed (HIC.0703927) and insured to pull permits in all CT towns.',
      },
      {
        q: 'What warranty comes with a new roof?',
        a: 'Your new roof comes with two warranties: a manufacturer warranty on the materials (up to 50 years depending on the shingle line) and our 10-year workmanship warranty covering any installation-related issues. Both warranties are fully transferable if you sell your home.',
      },
    ],
  },
  {
    slug: 'roof-repair',
    name: 'Roof Repair',
    shortName: 'Repair',
    description: 'Fast, reliable roof repairs with same-week service available. Leak detection, storm damage repair, flashing repair, and more. We fix it right the first time.',
    metaTitle: 'Roof Repair Connecticut | Trust Proof Roofing',
    metaDescription: 'Fast roof repair in CT. Same-week service, leak detection, storm damage, flashing repair. Licensed & insured. Call (959) 333-8569.',
    icon: '🔧',
    features: [
      'Same-week service available',
      'Accurate leak detection',
      'Storm damage repair',
      'Flashing repair and replacement',
      'Shingle replacement',
      'Honest assessment — repair vs. replace',
    ],
    faq: [
      {
        q: 'How much does roof repair cost in Connecticut?',
        a: 'Roof repair costs in CT range from $300 for minor shingle fixes to $8,000+ for major repairs involving structural damage, widespread leaking, or full section replacement. We provide a free inspection and written estimate before any work begins.',
      },
      {
        q: 'How do I know if I need a repair or a full replacement?',
        a: "We'll give you an honest assessment after inspecting your roof. If your roof is under 15 years old, the damage is isolated, and the underlying decking is sound, repair is usually the right call. If your roof is 20+ years old with widespread granule loss, multiple leak points, or significant structural damage, replacement often makes more financial sense.",
      },
      {
        q: 'Can you repair my roof in winter?',
        a: 'Yes. We perform roof repairs year-round in Connecticut. In cold weather, we use cold-weather adhesives and follow proper installation protocols. Emergency tarping is available immediately when temperatures or conditions prevent permanent repair.',
      },
    ],
  },
  {
    slug: 'roof-inspection',
    name: 'Roof Inspection',
    shortName: 'Inspection',
    description: 'Comprehensive roof inspections for homebuyers, insurance purposes, and annual maintenance. Detailed written reports with photos delivered same day.',
    metaTitle: 'Roof Inspection Connecticut | Trust Proof Roofing',
    metaDescription: 'Professional roof inspections in CT. Homebuyer, insurance & maintenance inspections. Detailed photo report same day. Call (959) 333-8569.',
    icon: '🔍',
    features: [
      'Homebuyer pre-purchase inspections',
      'Insurance claim documentation',
      'Annual maintenance inspections',
      'Detailed written report with photos',
      'Same-day report delivery',
      'No sales pressure — honest assessment',
    ],
    faq: [
      {
        q: 'How much does a roof inspection cost in Connecticut?',
        a: 'Professional roof inspections in CT typically cost $150 to $350. For homebuyers, this is a small investment compared to the cost of unexpected roof replacement after purchase. We provide a detailed written report with photos you can share with sellers, real estate agents, or insurance companies.',
      },
      {
        q: 'What does a roof inspection include?',
        a: 'Our roof inspection covers: shingle condition and remaining life estimate, flashing integrity at chimneys, skylights, and vents, gutter condition, soffit and fascia condition, attic ventilation assessment, identification of any active leaks or moisture damage, and documentation of any code deficiencies. You receive a written report with photos same day.',
      },
    ],
  },
  {
    slug: 'emergency-roofing',
    name: 'Emergency Roofing',
    shortName: 'Emergency',
    description: 'Emergency tarping and repair available 7 days a week. Storm damage, fallen trees, sudden leaks. We respond within 2-4 hours to protect your home.',
    metaTitle: 'Emergency Roofing Connecticut | Trust Proof Roofing',
    metaDescription: '24/7 emergency roofing in CT. 2-4 hour response. Storm damage, tarping, fallen trees. Call (959) 333-8569 now.',
    icon: '⚡',
    features: [
      '7-day availability',
      '2-4 hour response time',
      'Emergency tarping',
      'Storm damage assessment',
      'Insurance claim documentation',
      'Fallen tree damage repair',
    ],
    faq: [
      {
        q: 'How fast can you respond to a roofing emergency in Connecticut?',
        a: 'We target a 2-4 hour response time for roofing emergencies across Connecticut. Our priority is stopping further damage to your home as quickly as possible. Emergency tarping can be completed the same day in most cases.',
      },
      {
        q: 'Does my homeowner insurance cover emergency roof repair?',
        a: 'Most Connecticut homeowner insurance policies cover sudden and accidental damage from storms, fallen trees, and similar events. We document all damage thoroughly to support your insurance claim and can work directly with your adjuster. Gradual damage from deferred maintenance is generally not covered.',
      },
    ],
  },
  {
    slug: 'commercial-roofing',
    name: 'Commercial Roofing',
    shortName: 'Commercial',
    description: 'Commercial flat roof systems including TPO, EPDM, and modified bitumen. Metal roofing and maintenance programs for businesses across Connecticut.',
    metaTitle: 'Commercial Roofing Connecticut | Trust Proof Roofing',
    metaDescription: 'Commercial roofing in CT. TPO, EPDM, flat roofs, metal roofing. Maintenance programs for businesses. Licensed & insured. Free estimate.',
    icon: '🏢',
    features: [
      'TPO roofing systems',
      'EPDM flat roofing',
      'Modified bitumen',
      'Metal roofing',
      'Preventive maintenance programs',
      'Commercial leak repair',
    ],
    faq: [
      {
        q: 'What types of commercial roofing do you install in Connecticut?',
        a: 'We install TPO (thermoplastic polyolefin), EPDM (rubber), modified bitumen, built-up roofing (BUR), and standing seam metal roofing for commercial properties across CT. We assess each building individually and recommend the system that best fits your budget and performance requirements.',
      },
      {
        q: 'Do you offer commercial roof maintenance programs?',
        a: 'Yes. We offer annual and bi-annual commercial roof maintenance programs that include inspection, minor repairs, drain clearing, and documentation. Preventive maintenance extends roof life significantly and helps you avoid costly emergency repairs.',
      },
    ],
  },
  {
    slug: 'gutters',
    name: 'Gutters & Drainage',
    shortName: 'Gutters',
    description: 'Seamless aluminum gutters, gutter guards, and ice dam prevention. Proper drainage is essential to protecting your roof and foundation in Connecticut.',
    metaTitle: 'Gutter Installation Connecticut | Trust Proof Roofing',
    metaDescription: 'Seamless aluminum gutters in CT. Gutter guards, ice dam prevention. $6-12/ft installed. Licensed & insured. Free estimate.',
    icon: '🌧️',
    features: [
      'Seamless aluminum gutters',
      'Gutter guard installation',
      'Ice dam prevention',
      'Downspout extension',
      'Gutter cleaning',
      'Fascia repair',
    ],
    faq: [
      {
        q: 'How much do gutters cost in Connecticut?',
        a: 'Seamless aluminum gutters in CT typically cost $6 to $12 per linear foot installed, depending on gutter size (5" vs 6") and your home configuration. A typical colonial home runs $800 to $2,000. Copper gutters and gutter guards are additional. We provide free estimates.',
      },
      {
        q: 'Are gutter guards worth it in Connecticut?',
        a: "Gutter guards are a worthwhile investment for most CT homes, especially those with significant tree coverage. Connecticut's fall leaf season and spring seed drops can clog gutters quickly. Quality micro-mesh guards virtually eliminate cleaning while preventing ice dam formation at the eaves.",
      },
    ],
  },
  {
    slug: 'storm-damage',
    name: 'Storm Damage Restoration',
    shortName: 'Storm Damage',
    description: 'Full storm damage restoration including hail, wind, and fallen trees. We assist with insurance claims from initial documentation through final payment.',
    metaTitle: 'Storm Damage Roofing Connecticut | Trust Proof Roofing',
    metaDescription: 'Storm damage roof restoration in CT. Insurance claim assistance, hail, wind, tree damage. Call (959) 333-8569 for free inspection.',
    icon: '🌪️',
    features: [
      'Hail damage assessment',
      'Wind damage repair',
      'Fallen tree restoration',
      'Insurance claim assistance',
      'Photo documentation for claims',
      'Direct adjuster communication',
    ],
    faq: [
      {
        q: 'How do I file a roof insurance claim in Connecticut?',
        a: "After a storm, document visible damage with photos, then call your insurance company to report the claim. An adjuster will be assigned to inspect. We recommend having us inspect first so we can accompany the adjuster and ensure all damage is properly documented. We've helped hundreds of CT homeowners navigate this process.",
      },
      {
        q: 'How long do I have to file a storm damage claim in Connecticut?',
        a: 'Connecticut homeowner insurance policies typically require claims to be filed within 1 to 2 years of the loss event, but it varies by policy. Check your policy language. More practically, the sooner you file after a storm, the easier it is to document that damage was storm-related rather than from pre-existing conditions.',
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
