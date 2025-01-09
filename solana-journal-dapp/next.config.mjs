/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Journal',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
