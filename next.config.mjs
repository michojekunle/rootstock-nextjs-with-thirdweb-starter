/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      // pino uses thread-stream (Node.js worker_threads) for async transport,
      // which doesn't exist in browsers. @walletconnect/sign-client pulls pino
      // transitively, so Turbopack tries to bundle it for the client SSR path.
      // Stub both packages out for the browser bundle.
      "thread-stream": "./lib/stubs/noop.js",
      "pino/lib/transport": "./lib/stubs/noop.js",
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      lokijs: false,
      encoding: false,
    };
    config.ignoreWarnings = [
      { module: /node_modules\/pino/ },
      { module: /node_modules\/thread-stream/ },
    ];
    return config;
  },
}

export default nextConfig
