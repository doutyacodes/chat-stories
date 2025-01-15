import createNextIntlPlugin from "next-intl/plugin";

// Create Next.js plugin for internationalization
const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'wowfy.in',  // Allow images from wowfy.in
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude the ssh2 module from being bundled on the client side
    if (!isServer) {
      config.externals = [...(config.externals || []), 'ssh2'];
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
