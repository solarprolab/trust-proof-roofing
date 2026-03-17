// Site configuration
export const SITE = {
  name: 'Trust Proof Roofing',
  tagline: 'Proof Overhead.',
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
  founded: '',
  owner: 'Tenzin',
};

export interface ServiceSection {
  heading: string;
  body?: string;
  items?: string[];
}

export interface Service {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  features: string[];
  sections: ServiceSection[];
  faq: { q: string; a: string }[];
}

export const SERVICES: Service[] = [
  {
    slug: 'roof-replacement',
    name: 'Roof Replacement',
    shortName: 'Replacement',
    description: 'Complete roof replacement using premium shingle brands including GAF and Owens Corning. 20-year leak warranty and manufacturer warranties up to 50 years.',
    metaTitle: 'Roof Replacement in Connecticut',
    metaDescription: 'Complete roof replacement in CT. Premium shingle brands including GAF and Owens Corning. 20-year leak warranty, manufacturer warranties up to 50 years. Free estimate.',
    icon: '🏠',
    features: [
      'Licensed and insured — CT HIC #HIC.0703927',
      'Premium shingle brands including GAF and Owens Corning',
      '20-year leak warranty',
      'Manufacturer warranties up to 50 years',
      'Full tear-off and disposal included',
      'Ice & water shield in all valleys',
      'Detailed written estimate before work begins',
    ],
    sections: [
      {
        heading: 'The Trust Proof Replacement Process',
        body: 'Most roofing companies show up, tear off your old roof, and install the new one while you hope for the best. We do it differently. Before a single shingle comes off, we fly a drone over your entire roof so you can see exactly what we\'re working with — every layer, every problem area, every inch of decking condition. You watch the footage with us. Nothing is hidden. From there you get a written proposal within 24 hours — itemized materials, exact scope, payment schedule, and start date. No verbal estimates, no surprise line items on the final invoice.',
      },
      {
        heading: "What's Included in Every Replacement",
        items: [
          'Full tear-off and disposal of all existing layers.',
          'Inspection of the decking underneath — any rotted or damaged sheathing is photographed, documented, and repaired before new materials go on.',
          'Ice and water shield in all valleys, eaves, and around all penetrations.',
          'Synthetic underlayment across the full deck.',
          'New drip edge, step flashing, and counter flashing at all walls and chimneys.',
          'Ridge vent installation for proper attic ventilation.',
          'Magnetic nail sweep of the entire property at completion.',
          'Final aerial drone shot of the finished roof.',
        ],
      },
      {
        heading: 'Material Options for Connecticut Homes',
        body: 'Architectural asphalt shingles are the right choice for most CT homeowners — they handle freeze-thaw cycles well, carry 25–30 year manufacturer warranties, and deliver strong value. Impact-resistant shingles are worth considering if your neighborhood has hail history or if your insurance offers a discount for them. Premium designer shingles replicate the look of slate or cedar shake without the maintenance burden — good fit for higher-value homes where curb appeal matters. We\'ll walk you through the trade-offs for your specific situation and never upsell you on material you don\'t need.',
      },
      {
        heading: 'Connecticut-Specific Considerations',
        body: 'Ice dams are the #1 cause of interior water damage in CT homes every winter. Proper ice and water shield installation at the eaves — and correct attic ventilation — is what prevents them. We treat both as standard, not optional upgrades. New England\'s weather also means your roof goes through more expansion and contraction cycles than almost anywhere else in the country. Proper nailing patterns and starter strip installation matter here more than they do in Florida. We follow manufacturer specs precisely because that\'s what keeps the warranty valid and the roof performing.',
      },
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
        a: 'Yes, most Connecticut municipalities require a building permit for full roof replacements. We handle the permit process for you as part of our service. We are fully licensed (CT HIC #HIC.0703927) and insured to pull permits in all CT towns.',
      },
      {
        q: 'What warranty comes with a new roof?',
        a: 'Your new roof comes with two warranties: a manufacturer warranty on the materials (up to 50 years depending on the shingle line) and our 20-year leak warranty on all roof replacements, plus a 1-year warranty on repairs. Both warranties are fully transferable if you sell your home.',
      },
    ],
  },
  {
    slug: 'roof-repair',
    name: 'Roof Repair',
    shortName: 'Repair',
    description: 'Fast, reliable roof repairs with same-week service available. Leak detection, storm damage repair, flashing repair, and more. We fix it right the first time.',
    metaTitle: 'Roof Repair in Connecticut',
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
    sections: [
      {
        heading: 'How We Diagnose Before We Fix',
        body: 'The most common roofing mistake in Connecticut is patching the symptom instead of the source. A water stain on your ceiling might be caused by a failed flashing at your chimney — 12 feet from where the water appeared. We fly the drone first, every time, before recommending any repair. You see what we see. Then we give you a written scope before touching anything.',
      },
      {
        heading: 'Common CT Repair Scenarios',
        body: 'Flashing failures are the leading cause of leaks in CT — at chimneys, skylights, dormers, and roof-to-wall intersections. Flashing expands and contracts with temperature and eventually separates. Granule loss from aging shingles leaves the asphalt exposed to UV and accelerates deterioration — visible as bare patches or granules collecting in your gutters. Wind-lifted or missing shingles after storms need to be addressed quickly before the underlayment gets compromised. Ice dam damage shows up as water infiltration at the eaves in late winter or spring — the repair often includes adding ice and water shield at the affected area.',
      },
      {
        heading: 'Repair vs. Replace — The Honest Answer',
        body: 'If your roof is under 15 years old and the damage is isolated, repair almost always makes sense. If it\'s over 20 years old, has multiple problem areas, or the granule loss is widespread, replacement is likely the better investment — patching a failing roof delays the inevitable and costs more in the long run. We\'ll tell you which one your situation actually calls for, even when that means a smaller job for us.',
      },
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
    metaTitle: 'Roof Inspection in Connecticut',
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
    sections: [
      {
        heading: 'What a Trust Proof Inspection Covers',
        body: 'We fly a drone over your entire roof before setting foot on it — capturing video of every plane, valley, flashing point, ridge, and penetration. You get a written report with photos delivered the same day, documenting existing conditions, any areas of concern, estimated remaining lifespan, and specific recommendations. No vague assessments — specific findings, specific locations, specific next steps.',
      },
      {
        heading: 'When You Need One',
        items: [
          'Before buying a home — a roof inspection is one of the most important pre-purchase steps a CT buyer can take. A 22-year-old roof that needs replacement in year 1 is a $12,000–$16,000 negotiating point.',
          'After a major storm — hail and high winds cause damage that isn\'t always visible from the ground. An inspection with drone documentation gives you evidence for an insurance claim if damage exists.',
          'Annual maintenance — catching a failed flashing or small leak early costs hundreds. Ignored, it costs thousands in interior damage.',
          'Before selling — knowing your roof condition lets you price accurately and avoid surprises during the buyer\'s inspection.',
        ],
      },
      {
        heading: 'The Drone Difference',
        body: 'A traditional roof inspection means someone walking your roof and eyeballing it. Our drone captures footage of every inch, including areas a person cannot safely reach on steep pitches or complex roof lines. The footage is yours — we share it with you directly. If you ever need to reference existing conditions for an insurance claim, a sale, or a dispute, you have dated, documented visual evidence.',
      },
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
    metaTitle: 'Emergency Roofing in Connecticut',
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
    sections: [
      {
        heading: 'What to Do Right Now',
        body: 'If you have an active leak or storm damage, call us at (959) 333-8569. While you wait: place buckets or towels to catch interior water, move valuables away from affected areas, and take your own photos if it is safe to do so — date-stamped phone photos are useful for insurance purposes. Do not go on the roof yourself.',
      },
      {
        heading: 'Our Emergency Response',
        body: 'We respond within 2–4 hours for active emergencies. First priority is stopping water infiltration — emergency tarping or temporary patching to protect your home\'s interior while we assess the full scope. We document all damage with drone footage and photos before any work begins. You get a written scope and price before we proceed with permanent repairs.',
      },
      {
        heading: 'Storm Season in Connecticut',
        body: 'CT gets hit hardest in three windows — nor\'easters from November through March, hail events in late spring and early summer, and tropical remnants in late summer and fall. High winds are the most common source of emergency calls — lifted or missing shingles that expose the underlayment to rain. Fallen branches and trees are the most serious — they can puncture decking and rafters, not just shingles. If a tree has hit your roof, do not assume the damage is limited to what is visible from outside.',
      },
    ],
    faq: [
      {
        q: 'How fast can you respond to a roofing emergency in Connecticut?',
        a: 'We target a 2-4 hour response time for roofing emergencies across Connecticut. Our priority is stopping further damage to your home as quickly as possible. Emergency tarping can be completed the same day in most cases.',
      },
      {
        q: 'Does my homeowner insurance cover emergency roof repair?',
        a: 'Most Connecticut homeowner insurance policies cover sudden and accidental damage from storms, fallen trees, and similar events. We document all damage thoroughly with photos and reports that support your insurance claim. You handle the claim with your insurer — we provide the documentation you need. Gradual damage from deferred maintenance is generally not covered.',
      },
    ],
  },
  {
    slug: 'storm-damage',
    name: 'Storm Damage Restoration',
    shortName: 'Storm Damage',
    description: 'Full storm damage restoration including hail, wind, and fallen trees. We document all damage thoroughly with photos and reports to support your insurance claim.',
    metaTitle: 'Storm Damage Roofing in Connecticut',
    metaDescription: 'Storm damage roof restoration in CT. Detailed photo documentation for insurance claims. Hail, wind, tree damage. Call (959) 333-8569 for free inspection.',
    icon: '🌪️',
    features: [
      'Hail damage assessment',
      'Wind damage repair',
      'Fallen tree restoration',
      'Detailed photo documentation for claims',
      'Written damage reports',
      'Honest assessment of storm vs. pre-existing damage',
    ],
    sections: [
      {
        heading: 'Documentation First — Always',
        body: 'Insurance adjusters visit your property once, often briefly, and their assessment determines your claim outcome. The single most important thing you can do after storm damage is get professional documentation before anything is touched or repaired. We respond same-day after major storm events specifically for this reason — drone footage and a written damage report from a licensed CT contractor carries weight with insurers in a way that phone photos alone do not.',
      },
      {
        heading: 'What We Document',
        items: [
          'Every affected roof plane captured on drone video.',
          'Individual photos of each damaged area with location context.',
          'Identification of hail strikes vs. wind damage vs. pre-existing wear — adjusters sometimes attribute storm damage to wear and tear to minimize payouts.',
          'A written damage assessment on Trust Proof letterhead with our CT HIC license number.',
        ],
      },
      {
        heading: 'What We Will Not Do',
        body: 'We are not a public adjuster and we do not pretend to be one. We will not promise you a specific insurance outcome, negotiate with your insurer on your behalf, or waive your deductible. Any contractor making those promises is likely in violation of CT law. What we will do is give you the most thorough, honest documentation possible so your adjuster has the full picture.',
      },
      {
        heading: 'Hail vs. Wind — What to Look For',
        body: 'Hail damage shows up as soft spots or circular impact marks on shingles — often invisible from the ground, clearly visible on drone footage. Wind damage is more obvious: lifted, creased, or missing shingles, damaged ridge caps, separated flashing. Both can occur in the same storm. CT\'s spring hail events are frequently underestimated — a storm that felt minor at ground level can leave significant impact damage on roofing materials.',
      },
    ],
    faq: [
      {
        q: 'How do I file a roof insurance claim in Connecticut?',
        a: "After a storm, document visible damage with photos, then contact your insurance company to report the claim. We recommend having us inspect first so we can provide a detailed photo report and written damage documentation. You handle the claim with your insurer — we give you the documentation you need to support it.",
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
