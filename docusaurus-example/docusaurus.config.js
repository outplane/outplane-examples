module.exports = {
  title: "Out Plane Docs",
  tagline: "A Docusaurus example for deployment demos",
  url: "http://localhost:8080",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.svg",
  organizationName: "outplane",
  projectName: "docusaurus-example",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: "light",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Out Plane Docs",
      items: [
        { to: "/docs/intro", label: "Docs", position: "left" },
        { to: "/#features", label: "Highlights", position: "left" },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [{ label: "Intro", to: "/docs/intro" }],
        },
        {
          title: "Out Plane",
          items: [
            { label: "Console", href: "https://console.outplane.com" },
            { label: "Platform", href: "https://outplane.com" },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Out Plane`,
    },
  },
};
