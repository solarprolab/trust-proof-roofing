export interface CityPage {
  slug: string;
  city: string;
  county: string;
  population: number;
  medianHomeValue: number;
  avgRoofReplacementCost: string;
  avgRoofAge: number;
  commonRoofType: string;
  weatherChallenges: string[];
  neighborhoods: string[];
  zipCodes: string[];
  localAngle: string;
  seasonalNote: string;
  nearbyCity: { city: string; slug: string }[];
  faq: { q: string; a: string }[];
}

export const CT_CITIES: CityPage[] = [
  {
    slug: 'stamford',
    city: 'Stamford',
    county: 'Fairfield',
    population: 136000,
    medianHomeValue: 615000,
    avgRoofReplacementCost: '$14,000–$22,000',
    avgRoofAge: 18,
    commonRoofType: 'Architectural Asphalt Shingles',
    weatherChallenges: ['Salt air corrosion', 'Coastal wind exposure', 'Long Island Sound storms', 'Freeze-thaw cycles'],
    neighborhoods: ['Shippan Point', 'Harbor Point', 'North Stamford', 'Glenbrook', 'Springdale', 'Newfield'],
    zipCodes: ['06901', '06902', '06903', '06905', '06906', '06907'],
    localAngle: "Stamford's position directly on Long Island Sound creates roofing challenges that inland Connecticut towns simply don't face. Salt air carried off the Sound accelerates shingle deterioration at a measurable rate — Shippan Point homeowners routinely see their roofs fail 3 to 5 years earlier than comparable homes just a few miles inland. The granule loss happens faster, the metal components oxidize quicker, and algae growth along the shoreline is relentless. Harbor Point's newer condo developments have their own set of concerns with flat and low-slope roofing systems that require different maintenance than traditional pitched roofs. Whether you're in a classic Colonial off Shippan Avenue or a modern unit at Harbor Point, the coastal exposure here demands a roofing contractor who understands salt-air environments and specifies materials accordingly.",
    seasonalNote: "Stamford's coastal location means nor'easters hit harder here than anywhere else in the state. After any significant storm between October and April, inspect your roof from the ground and call us if you see lifted shingles or missing flashing.",
    nearbyCity: [
      { city: 'Greenwich', slug: 'greenwich' },
      { city: 'Norwalk', slug: 'norwalk' },
      { city: 'Fairfield', slug: 'fairfield' },
    ],
    faq: [
      {
        q: 'How does the coastal climate affect roofs in Stamford?',
        a: "Salt air from Long Island Sound accelerates the breakdown of shingle granules and metal roofing components. Stamford homeowners — especially near Shippan Point and the waterfront — should expect roof lifespans 3-5 years shorter than inland CT averages. We recommend algae-resistant shingles and stainless steel or copper flashing for coastal properties.",
      },
      {
        q: 'What does a roof replacement cost in Stamford, CT?',
        a: 'Stamford roof replacements typically run $14,000 to $22,000 for a standard residential home, reflecting both the local labor market and the premium materials recommended for coastal exposure. Complex rooflines with dormers or high pitches will be at the higher end.',
      },
      {
        q: 'Do you serve all Stamford neighborhoods?',
        a: 'Yes. We serve all Stamford neighborhoods including Shippan Point, Harbor Point, North Stamford, Glenbrook, Springdale, and Newfield. All work is performed by our own licensed crew — we do not subcontract.',
      },
      {
        q: 'How quickly can you respond to storm damage in Stamford?',
        a: "Stamford is one of our priority service areas. We typically respond to emergency calls within 2-4 hours. After a nor'easter or major storm, we recommend calling as soon as it's safe to assess damage before any rain events compound the problem.",
      },
    ],
  },
  {
    slug: 'greenwich',
    city: 'Greenwich',
    county: 'Fairfield',
    population: 63500,
    medianHomeValue: 1425000,
    avgRoofReplacementCost: '$18,000–$45,000',
    avgRoofAge: 22,
    commonRoofType: 'Natural Slate & Cedar Shake',
    weatherChallenges: ['Coastal salt air', 'High wind exposure', 'Heavy snow loads on complex rooflines', 'Ice dams on steep pitches'],
    neighborhoods: ['Cos Cob', 'Riverside', 'Old Greenwich', 'Byram', 'Glenville', 'Backcountry'],
    zipCodes: ['06830', '06831', '06836'],
    localAngle: "Greenwich presents a uniquely complex roofing environment driven by its architectural heritage and the expectations of its real estate market. The town's historic estate homes were built with natural slate, cedar shake, and clay tile — materials that require specialized knowledge most Connecticut roofers simply don't have. The Historic District Commission governs what materials can be used on many properties, meaning a replacement that would pass muster in Danbury might be rejected outright in a Greenwich historic zone. Backcountry estates often feature roof systems with multiple dormers, turrets, and intersecting valleys that multiply both the skill required and the time to complete properly. At the $1.4M+ median home value, buyers and sellers here are sophisticated — a substandard roof replacement will be caught in inspection and will cost you far more in price negotiation than the repair itself. We bring the material knowledge, Historic District familiarity, and attention to detail that Greenwich homes demand.",
    seasonalNote: "Greenwich's steep-pitched historic roofs are particularly prone to ice dam formation during freeze-thaw cycles. Proper attic ventilation and ice-and-water shield installation are critical. Have your attic ventilation assessed every 5 years.",
    nearbyCity: [
      { city: 'Stamford', slug: 'stamford' },
      { city: 'Norwalk', slug: 'norwalk' },
      { city: 'Fairfield', slug: 'fairfield' },
    ],
    faq: [
      {
        q: 'Can you work on historic homes in Greenwich?',
        a: "Yes. We're familiar with Greenwich's Historic District Commission requirements and have experience working with natural slate, cedar shake, and clay tile roofing on historic properties. We can advise on approved materials and help navigate the permit process for historic properties.",
      },
      {
        q: 'How much does a roof replacement cost in Greenwich, CT?',
        a: "Greenwich roof replacements vary enormously based on size, pitch, and materials. A standard home with architectural asphalt shingles might run $18,000-$28,000. Natural slate or cedar shake on a large estate can reach $45,000 or significantly more. We provide detailed written estimates for every job.",
      },
      {
        q: 'Do you replace natural slate roofs in Greenwich?',
        a: "Yes. Natural slate roof work requires specialized skills and tools that most roofers don't have. We can assess whether your slate roof needs repair (often the case — individual slates can be replaced) or full replacement, and source matching slate when needed.",
      },
      {
        q: 'What roofing materials are appropriate for Greenwich historic homes?',
        a: "For historic Greenwich properties, we work with natural slate, synthetic slate (a cost-effective alternative), cedar shake, architectural shingles that meet HDC requirements, and copper flashing. We'll help you understand what's permitted for your specific property zone.",
      },
      {
        q: 'How do you handle complex roof designs with dormers and turrets?',
        a: "Complex rooflines require careful planning, proper sequencing, and experienced crews. We price these jobs accurately upfront, assign experienced lead crews, and don't rush — complex geometry means more hand-cutting and more time. We'd rather do it right than do it fast.",
      },
    ],
  },
  {
    slug: 'norwalk',
    city: 'Norwalk',
    county: 'Fairfield',
    population: 89500,
    medianHomeValue: 525000,
    avgRoofReplacementCost: '$12,000–$20,000',
    avgRoofAge: 21,
    commonRoofType: 'Architectural Asphalt Shingles',
    weatherChallenges: ['Coastal wind and salt exposure in Rowayton', 'Heavy snow in northern sections', 'Ice dams', 'Storm surge risk in low areas'],
    neighborhoods: ['SoNo', 'Rowayton', 'Wolfpit', 'East Norwalk', 'West Norwalk', 'Cranbury'],
    zipCodes: ['06850', '06851', '06852', '06853', '06854', '06855'],
    localAngle: "Norwalk's diverse housing stock creates a wide range of roofing situations under one city boundary. In SoNo, waterfront condos and converted commercial buildings have flat or low-slope roofing systems that require entirely different expertise than the steep-pitched 1950s ranch homes covering the Wolfpit neighborhood. Many of those Wolfpit ranches still have original 3-tab shingles installed in the 1980s and 1990s — they're statistically overdue for replacement and often show granule loss that homeowners mistake for normal wear. In Rowayton, the coastal exposure rivals anything in Stamford or Greenwich: salt air, wind-driven rain off Long Island Sound, and a community of older homes that were built before modern ice-and-water shield requirements. If you're buying in Norwalk, a thorough pre-purchase inspection is one of the most important steps you can take — and we'll give you an honest report, not a sales pitch.",
    seasonalNote: "Norwalk's proximity to the coast means winter storms often bring a mix of rain, sleet, and snow that's particularly damaging to aging rooflines. Check your attic after any major winter storm for signs of moisture penetration.",
    nearbyCity: [
      { city: 'Stamford', slug: 'stamford' },
      { city: 'Fairfield', slug: 'fairfield' },
      { city: 'Bridgeport', slug: 'bridgeport' },
    ],
    faq: [
      {
        q: 'What are the most common roofing issues in Norwalk?',
        a: "Norwalk's aging housing stock means we frequently see: original 3-tab shingles past their useful life in neighborhoods like Wolfpit, ice dam damage from inadequate insulation and ventilation, flashing failures at chimneys and skylights, and flat roof deterioration on SoNo commercial conversions.",
      },
      {
        q: 'How much does roof replacement cost in Norwalk, CT?',
        a: 'Most Norwalk homeowners pay between $12,000 and $20,000 for a full roof replacement on a standard residential home. SoNo condo buildings and complex rooflines will vary. We provide free estimates.',
      },
      {
        q: 'Do you serve Rowayton?',
        a: "Yes. Rowayton is one of our regular service areas. We understand the coastal exposure specific to Rowayton and recommend marine-grade materials and stainless steel components for homes closest to the water.",
      },
    ],
  },
  {
    slug: 'bridgeport',
    city: 'Bridgeport',
    county: 'Fairfield',
    population: 144900,
    medianHomeValue: 235000,
    avgRoofReplacementCost: '$8,500–$15,000',
    avgRoofAge: 28,
    commonRoofType: 'Modified Bitumen & 3-Tab Asphalt',
    weatherChallenges: ['Urban heat island effect', 'Heavy snowfall', 'Aging flat roof systems', 'Deferred maintenance throughout housing stock'],
    neighborhoods: ['Black Rock', 'East Side', 'North End', 'South End', 'West Side', 'Downtown'],
    zipCodes: ['06601', '06604', '06605', '06606', '06607', '06608', '06610'],
    localAngle: "As Connecticut's largest city, Bridgeport has a housing stock that tells the story of the city's economic history — and much of that story is visible on rooftops. The North End and East Side have extensive multi-family housing, many of them three-deckers with flat or low-slope roofs that were last properly maintained years ago. Deferred maintenance is common, and a surprising number of these buildings are running on roofing systems that are well past their design life. The Black Rock renaissance is a different story: buyers moving into this waterfront neighborhood for its character and value are smart to get thorough inspections before closing, because a 30-year-old roof on a home you just bought for the right price can quickly become the wrong price. We price our work fairly for the Bridgeport market and don't inflate estimates because a zip code happens to be Bridgeport. Quality roofing at honest prices — that's what this neighborhood deserves.",
    seasonalNote: "Bridgeport's urban density means ice melts and refreezes in complex patterns on flat roofs. After major snow events, flat roof drainage should be cleared to prevent ponding water, which accelerates membrane deterioration.",
    nearbyCity: [
      { city: 'Norwalk', slug: 'norwalk' },
      { city: 'Fairfield', slug: 'fairfield' },
      { city: 'New Haven', slug: 'new-haven' },
    ],
    faq: [
      {
        q: 'How much does a roof replacement cost in Bridgeport, CT?',
        a: "Bridgeport roof replacements typically run $8,500 to $15,000 for residential homes — among the most affordable in Fairfield County. We price work based on actual scope, not neighborhood. Multi-family buildings and commercial flat roofs are priced separately.",
      },
      {
        q: 'Do you work on multi-family buildings in Bridgeport?',
        a: "Yes. We work on two-families, three-families, and larger multi-unit buildings throughout Bridgeport. Flat roof systems (modified bitumen, TPO, EPDM) are our specialty for commercial and multi-family applications.",
      },
      {
        q: 'What roofing issues are most common in Bridgeport?',
        a: "The most common issues we find in Bridgeport are: flat roofs with failed seams and ponding water, 3-tab shingles well past their useful life, missing or improperly installed flashing, and inadequate attic ventilation leading to ice dams and premature shingle failure.",
      },
    ],
  },
  {
    slug: 'new-haven',
    city: 'New Haven',
    county: 'New Haven',
    population: 136000,
    medianHomeValue: 260000,
    avgRoofReplacementCost: '$10,000–$18,000',
    avgRoofAge: 26,
    commonRoofType: 'Architectural Asphalt & Original Slate',
    weatherChallenges: ['Heavy snow in colder winters', 'Ice dam formation on steep Victorian rooflines', 'Wind exposure near the harbor', 'Urban heat cycling'],
    neighborhoods: ['East Rock', 'Wooster Square', 'Westville', 'Fair Haven', 'The Hill', 'Edgewood'],
    zipCodes: ['06501', '06510', '06511', '06512', '06513', '06515', '06516', '06519'],
    localAngle: "New Haven's architectural diversity is extraordinary for a city its size, and that diversity creates a uniquely varied set of roofing challenges. East Rock and Wooster Square are filled with late Victorian and Edwardian homes — many still wearing their original slate roofs, which is both an asset and a liability. Original slate from the 1890s to 1920s is often still performing, but the metal flashing around chimneys and dormers has long since failed, turning a sound slate field into a leaking problem. Westville tells a different story: mid-century homes where deferred maintenance has compounded over decades, and where a new owner faces the decision of whether to address roofing at all. Yale's influence on the real estate market means New Haven sees a steady stream of buyers — faculty, medical staff, administrators — who are sophisticated and thorough in their inspections. A roof that barely passes for one buyer will cost you the next one.",
    seasonalNote: "New Haven's position between the coast and inland Connecticut means it sees a variable mix of winter precipitation. The steep Victorian rooflines in East Rock and Wooster Square are ice dam magnets during freeze-thaw cycles.",
    nearbyCity: [
      { city: 'Bridgeport', slug: 'bridgeport' },
      { city: 'West Hartford', slug: 'west-hartford' },
      { city: 'Waterbury', slug: 'waterbury' },
    ],
    faq: [
      {
        q: 'Can you work on original slate roofs in New Haven?',
        a: "Yes. Many East Rock and Wooster Square homes still have original slate, and repair — not replacement — is often the right answer. Individual slates can be replaced, and failed flashing can be rebuilt without touching a single original slate. We assess honestly and recommend repair when repair makes sense.",
      },
      {
        q: 'How much does roof replacement cost in New Haven, CT?',
        a: "New Haven roof replacements typically run $10,000 to $18,000 depending on size, pitch, and material. Victorian homes with steep pitches and complex geometry will be at the higher end. We provide free, detailed estimates.",
      },
      {
        q: 'What neighborhoods in New Haven do you serve?',
        a: 'We serve all New Haven neighborhoods including East Rock, Wooster Square, Westville, Fair Haven, The Hill, and Edgewood. We also serve surrounding towns including Hamden, West Haven, and East Haven.',
      },
    ],
  },
  {
    slug: 'hartford',
    city: 'Hartford',
    county: 'Hartford',
    population: 121000,
    medianHomeValue: 175000,
    avgRoofReplacementCost: '$8,000–$14,000',
    avgRoofAge: 30,
    commonRoofType: 'Modified Bitumen & Architectural Asphalt',
    weatherChallenges: ['Connecticut River valley weather patterns', 'Heavy snow and ice storms', 'Wind from multiple directions due to valley position', 'Extreme temperature swings'],
    neighborhoods: ['West End', 'Blue Hills', 'Asylum Hill', 'South End', 'North End', 'Frog Hollow'],
    zipCodes: ['06101', '06103', '06105', '06106', '06107', '06112', '06114', '06120'],
    localAngle: "Hartford sits at the heart of the Connecticut River valley, and the valley's topography means the city experiences weather arriving from every direction — cold Arctic air funneling down from the north, moisture-laden systems tracking up from Long Island Sound to the south, and heavy snow events that consistently exceed coastal totals. The West End's historic homes are among Hartford's most architecturally significant — many are properly maintained and well-loved, but the multi-family housing stock throughout the North End represents decades of ownership transitions and, in many cases, delayed capital investment. Those flat-roofed three-deckers are a priority concern: failed membrane seams, clogged drains, and ponding water are the norm rather than the exception when inspection is deferred too long. We bring honest pricing to Hartford — the city's affordability shouldn't mean accepting substandard roofing work.",
    seasonalNote: "Hartford's inland position amplifies temperature swings that drive freeze-thaw damage. Ice dams are common throughout the city during cold snaps following snowfall. Proper attic insulation is the most effective long-term prevention.",
    nearbyCity: [
      { city: 'West Hartford', slug: 'west-hartford' },
      { city: 'New Haven', slug: 'new-haven' },
      { city: 'Waterbury', slug: 'waterbury' },
    ],
    faq: [
      {
        q: 'How much does roof replacement cost in Hartford, CT?',
        a: "Hartford's affordable housing market means competitive roof replacement pricing: typically $8,000 to $14,000 for residential homes. We price based on actual scope and materials — Hartford homeowners deserve fair pricing and quality installation.",
      },
      {
        q: 'Do you work on multi-family buildings in Hartford?',
        a: 'Yes. Multi-family flat and low-slope roofing is a significant part of our Hartford work. We install and repair modified bitumen, TPO, and EPDM systems on two and three-family homes and larger residential buildings.',
      },
      {
        q: 'How do Hartford winters affect roofs?',
        a: "Hartford's Connecticut River valley position means it often receives more snow than coastal CT cities. The temperature swings drive aggressive freeze-thaw cycling that stresses shingles, flashing, and flat roof membranes. We recommend annual spring inspections after Hartford winters.",
      },
    ],
  },
  {
    slug: 'danbury',
    city: 'Danbury',
    county: 'Fairfield',
    population: 84900,
    medianHomeValue: 410000,
    avgRoofReplacementCost: '$11,000–$18,000',
    avgRoofAge: 24,
    commonRoofType: 'Architectural Asphalt Shingles',
    weatherChallenges: ['Higher snowfall than coastal CT', 'Hilly terrain creates wind tunnels', 'Candlewood Lake moisture effects', 'Heavy tree coverage causes debris and branch damage'],
    neighborhoods: ['Candlewood Lake area', 'Rogers Park', 'Shelter Rock', 'Germantown', 'Aunt Hack', 'Stadley Rough'],
    zipCodes: ['06810', '06811'],
    localAngle: "Danbury occupies a different climate zone than the coastal Fairfield County cities. Sitting inland in the western highlands, it consistently records higher snowfall totals, and the hilly terrain creates localized wind patterns that can funnel gusts through neighborhoods in ways that surprise homeowners who moved from the coast. The Candlewood Lake area adds a moisture dimension unique to this part of the state — homes closest to the water see more moss and algae growth, and the humidity accelerates the breakdown of organic roofing components. The city's 1990s residential development boom is hitting a significant milestone: those subdivisions from 1995 to 2000 are now approaching their 25 to 30 year mark, which is exactly when architectural shingles begin failing in earnest. The roofs look fine from the ground. The granules tell a different story up close. If your Danbury home was built in the 1990s, a professional inspection is a smart move before you face an emergency.",
    seasonalNote: "Danbury receives significantly more snow than coastal Connecticut — sometimes 20-30% more in a given winter. Heavy tree coverage also means branch damage from ice storms is a regular occurrence. We recommend trimming overhanging limbs as a preventive measure.",
    nearbyCity: [
      { city: 'Norwalk', slug: 'norwalk' },
      { city: 'Bridgeport', slug: 'bridgeport' },
      { city: 'Waterbury', slug: 'waterbury' },
    ],
    faq: [
      {
        q: 'Why does Danbury get more snow than the coast?',
        a: "Danbury's inland elevation and western CT position put it in a different weather pattern than coastal cities. It regularly sees 20-30% higher annual snowfall than Stamford or Norwalk, which means more stress on roofing systems from snow load and freeze-thaw cycling.",
      },
      {
        q: 'My Danbury home was built in the 1990s. Should I get a roof inspection?',
        a: "Yes, absolutely. 1990s-era architectural shingles are at or near the end of their design life (25-30 years). Even if they look fine from the ground, granule loss and underlayment degradation may have progressed significantly. A professional inspection gives you clarity before a failure forces your hand.",
      },
      {
        q: 'How much does roof replacement cost in Danbury, CT?',
        a: 'Danbury roof replacements typically run $11,000 to $18,000 for a standard residential home. Homes near Candlewood Lake or with significant tree coverage may have additional considerations. Free estimates provided.',
      },
    ],
  },
  {
    slug: 'waterbury',
    city: 'Waterbury',
    county: 'New Haven',
    population: 114400,
    medianHomeValue: 180000,
    avgRoofReplacementCost: '$8,000–$13,000',
    avgRoofAge: 32,
    commonRoofType: '3-Tab Asphalt & Modified Bitumen',
    weatherChallenges: ['Heavy snowfall in inland CT', 'Aggressive freeze-thaw cycling', 'Aging housing stock with deferred maintenance', 'Wind exposure on hilltop neighborhoods'],
    neighborhoods: ['East End', 'North End', 'South End', 'Brooklyn', 'Bucks Hill', 'Town Plot'],
    zipCodes: ['06701', '06702', '06704', '06705', '06706', '06708', '06710'],
    localAngle: "Waterbury is the most affordable housing market on this list, and that affordability has an unfortunate side effect: the city attracts bottom-tier contractors who undercut legitimate companies, cut corners on materials, and disappear when problems emerge. The Brass City's housing stock is genuinely old — much of it dating to the early twentieth century when the brass industry was booming — and it has been maintained with varying levels of care over the generations. The East End and North End in particular have extensive residential stock where original roofs or poorly-done replacements are commonplace. A homeowner in Waterbury deserves the same quality installation as a homeowner in Greenwich; what changes is the price point, not the standard of work. We bring the same licensed crew, the same manufacturer-approved installation practices, and the same warranty to Waterbury that we bring anywhere else in Connecticut.",
    seasonalNote: "Waterbury's inland position and elevation mean it regularly exceeds Hartford's snowfall totals. The combination of heavy snow, ice, and the oldest housing stock in the region makes proactive roof maintenance especially important here.",
    nearbyCity: [
      { city: 'New Haven', slug: 'new-haven' },
      { city: 'Hartford', slug: 'hartford' },
      { city: 'Danbury', slug: 'danbury' },
    ],
    faq: [
      {
        q: 'How do I avoid getting scammed by roofing contractors in Waterbury?',
        a: "Always verify a contractor's CT Home Improvement Contractor (HIC) license before signing anything. Our license is HIC.0703927 — verify it at ct.gov. Get at least three written estimates, check reviews independently, and never pay more than 30% upfront. Storm-chasing contractors who appear after weather events and pressure you to sign immediately are a major risk.",
      },
      {
        q: 'How much does roof replacement cost in Waterbury, CT?',
        a: 'Waterbury offers some of the most competitive roof replacement pricing in Connecticut: typically $8,000 to $13,000 for a standard residential home. We price fairly for the market while maintaining the same quality standards we apply everywhere in CT.',
      },
    ],
  },
  {
    slug: 'west-hartford',
    city: 'West Hartford',
    county: 'Hartford',
    population: 64000,
    medianHomeValue: 420000,
    avgRoofReplacementCost: '$12,000–$20,000',
    avgRoofAge: 22,
    commonRoofType: 'Architectural Asphalt Shingles',
    weatherChallenges: ['Inland CT snow and ice', 'Freeze-thaw cycling', 'Ice dams on 1940s-1960s homes with marginal attic insulation', 'Wind from open exposures'],
    neighborhoods: ['West Hartford Center', 'Elmwood', 'Bishops Corner', 'Buena Vista', 'Corbins Corner', 'Quaker Lane South'],
    zipCodes: ['06107', '06110', '06119'],
    localAngle: "West Hartford is one of Connecticut's most consistently desirable suburbs, and the real estate market reflects it: buyers are educated, inspections are thorough, and homes that aren't properly maintained don't sell at asking price. The town's housing stock skews toward 1940s through 1960s Colonials and Capes — solid, well-built homes that have now had multiple ownership cycles and, in many cases, at least one prior roof replacement of varying quality. The challenge for current owners is that the buyer pool for West Hartford homes is sophisticated. Agents advise clients to scrutinize every major system, and a roof flagged in inspection becomes a negotiating liability. A new roof, properly documented with warranty, is actually a genuine selling point in West Hartford's competitive market — and buyers can tell the difference between a quality installation and a discount job. We've seen it play out repeatedly: the right roof, done right, pays for itself at closing.",
    seasonalNote: "West Hartford's inland position means colder winters than the coast. The 1940s-1960s Colonial homes that define much of the town were built before modern insulation standards — many have marginal attic insulation that sets the stage for ice dams. A ventilation and insulation assessment should accompany any new roof.",
    nearbyCity: [
      { city: 'Hartford', slug: 'hartford' },
      { city: 'New Haven', slug: 'new-haven' },
      { city: 'Waterbury', slug: 'waterbury' },
    ],
    faq: [
      {
        q: 'How does a new roof affect home value in West Hartford?',
        a: "In West Hartford's competitive market, a documented new roof with warranty is a genuine asset. Buyers and their agents scrutinize major systems closely. A roof that passes inspection — or better, a new roof with transferable warranty — removes a major negotiating liability and can support asking price.",
      },
      {
        q: 'How much does roof replacement cost in West Hartford, CT?',
        a: "West Hartford roof replacements typically run $12,000 to $20,000 for the town's standard Colonials and Capes. Larger homes with more complex rooflines will be higher. We provide detailed written estimates and our work comes with a 20-year leak warranty on roof replacements.",
      },
      {
        q: 'What are the most common roof problems in West Hartford?',
        a: "Ice dams are the most common issue we find in West Hartford, driven by the combination of cold inland winters and inadequate attic insulation in older homes. Failed flashing at chimneys and dormers is also common in homes that haven't had a thorough inspection in 10+ years.",
      },
    ],
  },
  {
    slug: 'fairfield',
    city: 'Fairfield',
    county: 'Fairfield',
    population: 62000,
    medianHomeValue: 685000,
    avgRoofReplacementCost: '$14,000–$24,000',
    avgRoofAge: 19,
    commonRoofType: 'Architectural Asphalt Shingles',
    weatherChallenges: ['Coastal salt spray on beach area homes', 'Greenfield Hill moss and shade issues', 'Nor\'easters off Long Island Sound', 'Wind and ice at beach properties'],
    neighborhoods: ['Greenfield Hill', 'Southport', 'Beach area', 'Black Rock Turnpike corridor', 'Holland Hill', 'Tunxis Hill'],
    zipCodes: ['06824', '06825'],
    localAngle: "Fairfield encompasses a remarkable range of property types and roofing environments within its borders. The Greenfield Hill neighborhood sits elevated above the coast in a dense woodland setting where shade and moisture create ideal conditions for moss and algae growth — roofs in Greenfield Hill that aren't treated with algae-resistant products or cleaned periodically can look decades older than they are. Down at the beach, the calculus is entirely different: salt spray off Long Island Sound accelerates metal oxidation and shingle granule loss, and the homes along Fairfield Beach Road take the full brunt of coastal storms. Southport's historic village homes bring their own character and constraints. At a median home value pushing $700,000, Fairfield homeowners understand that curb appeal is capital — and the roof is the most visible and most important element of a home's exterior presentation. We bring the same quality to every neighborhood in Fairfield, and we'll tell you straight what your roof needs.",
    seasonalNote: "Fairfield's beach properties should be inspected after every significant nor'easter. Greenfield Hill homeowners should inspect for moss and algae growth each spring, as shaded roofs in that neighborhood can develop biological growth quickly after wet winters.",
    nearbyCity: [
      { city: 'Bridgeport', slug: 'bridgeport' },
      { city: 'Norwalk', slug: 'norwalk' },
      { city: 'Stamford', slug: 'stamford' },
    ],
    faq: [
      {
        q: 'How does living near the beach affect my roof in Fairfield?',
        a: "Coastal salt air accelerates shingle granule loss and corrodes metal roofing components. Fairfield beach properties should use algae-resistant shingles, stainless steel or copper flashing, and plan for a somewhat shorter roof lifespan than inland homes. Annual inspections are recommended for beach-area homes.",
      },
      {
        q: 'Why does moss grow on roofs in Greenfield Hill?',
        a: "Greenfield Hill's dense tree canopy keeps roofs shaded and damp — ideal conditions for moss, algae, and lichen growth. These organisms hold moisture against shingles and accelerate deterioration. Algae-resistant shingles with copper granules are the most effective long-term solution, combined with zinc or copper strips at the ridge.",
      },
      {
        q: 'How much does roof replacement cost in Fairfield, CT?',
        a: 'Fairfield roof replacements typically run $14,000 to $24,000 for standard residential homes. Beach properties and larger Greenfield Hill estates may be higher based on size and material selection. Free estimates provided.',
      },
      {
        q: 'Do you serve Southport?',
        a: "Yes. Southport is one of our regular service areas within Fairfield. We're familiar with the historic homes and the material considerations specific to that neighborhood.",
      },
    ],
  },
];

export function getCityBySlug(slug: string): CityPage | undefined {
  return CT_CITIES.find((c) => c.slug === slug);
}
