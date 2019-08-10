const { fs, path } = require('@vuepress/shared-utils')

module.exports = ctx => ({
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '前端面试与进阶指南',
      description: '可能是全网最给力的前端面试项目'
    }
  },
  head: [
    ['link', { rel: 'icon', href: `/logo.svg` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  themeConfig: {
    repo: 'xiaomuzhu/front-end-interview',
    editLinks: true,
    docsDir: 'packages/docs/docs',
    locales: {
      '/': {
        editLinkText: '在 GitHub 上编辑此页',
        nav: require('./nav/zh'),
        sidebar: {
            '/guide/': renderSiderBar()
        }
      }
    }
  },
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: true
    }],
    ['@vuepress/medium-zoom', true],
    ['@vuepress/google-analytics', {
      ga: ''
    }],
    ['container', {
      type: 'vue',
      before: '<pre class="vue-container"><code>',
      after: '</code></pre>',
    }],
    ['container', {
      type: 'upgrade',
      before: info => `<UpgradePath title="${info}">`,
      after: '</UpgradePath>',
    }],
  ],
  extraWatchFiles: [
    '.vuepress/nav/zh.js',
  ]
})

function renderSiderBar() {
  return ([{
      title: '前言',
      collapsable: false,
      children: [
            '',
            'preface'
        ]
  },
  {
    title: '面试技巧',
    collapsable: false,
    children: [
          'resume',
          'project',
          'hr',
      ]
  },
  {
    title: '推荐',
    collapsable: false,
    children: [
          'book'
      ]
  },
  {
      title: '前端基础',
      collapsable: false,
      children: [
        'htmlBasic',
        'cssBasic',
        'jsBasic',
        'browser',
        'dom',
        'designPatterns',
      ]
  },
  {
    title: '前端基础笔试',
    collapsable: false,
    children: [
      'httpWritten',
      'jsWritten',
    ]
},
{
  title: '前端原理详解',
  collapsable: false,
  children: [
    'hoisting',
    'eventLoop',
    'immutable',
    'memory',
    'deepclone',
    'event',
    'mechanism',
  ]
},
{
  title: '数据结构与算法',
  collapsable: false,
  children: [
        'algorithm',
    ]
},
{
  title: '前端框架',
  collapsable: false,
  children: [
        'framework',
        'vue',
        'react',
    ]
},
{
  title: '框架原理详解',
  collapsable: true,
  children: [
        'virtualDom',
        'devsProxy',
        'setState',
        'router',
        'redux',
        'fiber',
        'abstract',
        'reactHook',
    ]
},
{
  title: '框架实战技巧',
  collapsable: true,
  children: [
        'componentCli',
        'component',
        'carousel',
    ]
},
{
  title: '性能优化',
  collapsable: true,
  children: [
        'load',
        'execute',
    ]
},
{
  title: '工程化',
  collapsable: true,
  children: [
        'webpack',
        'engineering',
    ]
},
{
  title: '工程化原理',
  collapsable: true,
  children: [
        'ast',
        'WebpackHMR',
        'webpackPlugin',
        'webpackPluginDesign',
        'webpackMoudle',
        'webpackLoader',
        'babelPlugin',
    ]
},
{
  title: '安全',
  collapsable: true,
  children: [
        'security',
    ]
},
{
  title: '计算机基础',
  collapsable: true,
  children: [
        'http',
        'tcp',
    ]
},
])
}