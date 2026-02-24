/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost', port: '8081' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8081' },
    ],
  },
  // Proxy all /api/* calls to the backend — no CORS, no hardcoded ports in components
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8081/uploads/:path*',
      },
    ];
  },
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
