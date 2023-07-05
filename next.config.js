const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        destination: "http://10.37.0.150:8000/:path*",
      },
    ];
  },
  plugins: [
    new MonacoWebpackPlugin({
      // languages: ['typescript', 'javascript', 'css'],
      // features: ["coreCommands", "find"],
      // filename: "static/[name].worker.js",
    })
  ]
}

module.exports = nextConfig
