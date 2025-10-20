const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '', // ή '/frontend' αν χρειάζεται
  assetPrefix: '', // ή 'https://your-site.netlify.app' αν χρειάζεται
}

module.exports = nextConfig