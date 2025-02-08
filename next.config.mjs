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
//     // Add node-loader to handle .node files (e.g., ssh2)
//     config.module.rules.push({
//       test: /\.node$/,
//       loader: 'node-loader',
//     });

//     // Exclude ssh2 module from being bundled on the client-side
//     if (!isServer) {
//       config.externals = [...(config.externals || []), 'ssh2'];
//     }
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       fs: false,
//     };

//     return config;
//   },
//   experimental: {
//     serverActions: {
//       bodySizeLimit: '100mb',
//     },
//   },
// };

// export default withNextIntl(nextConfig);


import createNextIntlPlugin from "next-intl/plugin";

// Create Next.js plugin for internationalization
const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wowfy.in',
        pathname: "/testusr/images/**", // Match all images in this folder
      },
    ],
    unoptimized: true, // Disable Next.js optimization
  },
  webpack: (config, { isServer }) => {
    // Add node-loader to handle .node files (e.g., ssh2)
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    // Exclude ssh2 module from being bundled on the client-side
    if (!isServer) {
      config.externals = [...(config.externals || []), 'ssh2'];
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
    responseLimit: false, // Disable response size limit
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'upgrade-insecure-requests'
          },
          {
            key: 'max-body-size',
            value: '100mb'
          }
        ],
      },
    ];
  }
};

export default withNextIntl(nextConfig);