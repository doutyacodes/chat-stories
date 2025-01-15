// import createNextIntlPlugin from "next-intl/plugin";

// // Create Next.js plugin for internationalization
// const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.pexels.com',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'wowfy.in',  // Allow images from wowfy.in
//         pathname: '**',
//       },
//     ],
//   },
//   webpack: (config, { isServer }) => {
//     // Exclude the ssh2 module from being bundled on the client side
//     if (!isServer) {
//       config.externals = [...(config.externals || []), 'ssh2'];
//     }
//     return config;
//   },
// };

// export default withNextIntl(nextConfig);


import createNextIntlPlugin from "next-intl/plugin";

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
        hostname: 'wowfy.in',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle SSH2 and related modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'ssh2': false,
        'ssh2-sftp-client': false,
        'crypto': false,
        'stream': false,
        'net': false,
        'tls': false,
        'fs': false
      };
    }

    // Add a specific rule for the sshcrypto.node file
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
      // Skip processing .node files in client-side builds
      loader: 'null-loader',
      resourceQuery: /client/,
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
