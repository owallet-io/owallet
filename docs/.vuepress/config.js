module.exports = {
  theme: 'cosmos',
  title: 'Oraichain wallet',
  locales: {
    '/': {
      lang: 'en-US'
    }
  },
  base: process.env.VUEPRESS_BASE || '/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon-svg.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://docs.owallet.app' }],
    [
      'meta',
      { property: 'og:title', content: 'Documentation | Oraichain Wallet' }
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'OWallet is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.'
      }
    ],
    [
      'meta',
      { property: 'og:image', content: 'https://docs.owallet.app/og-image.jpg' }
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],
  themeConfig: {
    custom: true,
    editLinks: true,
    repo: 'chainapsis/owallet-extension',
    docsRepo: 'chainapsis/owallet-extension',
    docsDir: 'docs',
    logo: {
      src: '/OWallet_Black.png'
    },
    topbar: {
      banner: false
    },
    sidebar: {
      auto: false,
      nav: [
        {
          title: 'API',
          children: [
            {
              title: 'OWallet API',
              directory: true,
              path: '/api'
            }
          ]
        }
      ]
    }
  },
  plugins: [],
  markdown: {
    extendMarkdown: (md) => {
      md.use(require('markdown-it-container'), 'suggest-chain-example-table');
    }
  }
};
