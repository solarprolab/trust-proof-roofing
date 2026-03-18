/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://trustproofroofing.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
  },
  transform: async (config, path) => {
    const highPriority = ['/', '/services', '/about', '/contact'];
    const isServicePage = path.startsWith('/services/');
    const isCityPage = path.startsWith('/roofing/ct/');
    const tier1 = ['suffield','enfield','windsor-locks','east-granby','granby','somers','east-windsor','bloomfield','windsor','simsbury','avon','canton','south-windsor','manchester','vernon','ellington','tolland'];
    const citySlug = path.replace('/roofing/ct/', '');
    return {
      loc: path,
      changefreq: isCityPage ? 'monthly' : config.changefreq,
      priority: highPriority.includes(path) ? 1.0 : isServicePage ? 0.9 : isCityPage ? (tier1.includes(citySlug) ? 0.95 : 0.8) : config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
