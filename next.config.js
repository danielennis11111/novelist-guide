/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
let basePath = '';

if (isGithubActions) {
  // Assuming the repository name is the last part of the GITHUB_REPOSITORY env var
  // e.g., GITHUB_REPOSITORY = "username/repository-name"
  const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.replace(/.*\//, '') : '';
  if (repo) {
    assetPrefix = `/${repo}/`;
    basePath = `/${repo}`;
  }
}

const nextConfig = {
  // output: process.env.EXPORT_MODE === 'static' ? 'export' : 'standalone',
  // basePath and assetPrefix are needed for GitHub Pages deployment
  assetPrefix: assetPrefix,
  basePath: basePath,
  output: 'export', // Force 'export' output mode for GitHub Pages
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'], // For Google profile images and Firebase storage
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
  },
  // Enable strict mode for better error catching
  reactStrictMode: true,
  // Handle Firebase private key formatting if needed
  webpack: (config, { isServer }) => {
    if (isServer && process.env.FIREBASE_PRIVATE_KEY) {
      process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
    
    // Handle Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        dns: false,
        stream: require.resolve('stream-browserify'),
        child_process: false,
        events: require.resolve('events/'),
        constants: false,
        async_hooks: false,
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        querystring: require.resolve('querystring-es3'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser'),
      };
      
      // Fix node: protocol imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:events': 'events',
        'node:stream': 'stream-browserify',
        'node:util': 'util',
        'node:buffer': 'buffer',
        'node:process': 'process/browser',
        'node:path': 'path-browserify',
        'node:crypto': 'crypto-browserify',
        'node:http': 'stream-http',
        'node:https': 'https-browserify',
        'node:os': 'os-browserify',
        'node:zlib': 'browserify-zlib',
        'node:querystring': 'querystring-es3',
        'node:url': 'url',
      };
      
      config.plugins.push(
        // Fix "process is not defined" error
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    
    return config
  },
  // Set env variables that might be needed
  env: {
    PORT: process.env.PORT || '3000',
    NEXT_PUBLIC_API_URL: "https://novelist-guide-backend-289372425801.us-central1.run.app"
  },
  // experimental: {
  //   serverActions: true,
  // },
}

module.exports = nextConfig 