import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Images and files uploaded in the Admin web are served by plc-portal through the gateway. */
  async rewrites() {
    const api = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
    return [{ source: "/api/portal/public/media/:path*", destination: `${api}/api/portal/public/media/:path*` }];
  },
};

export default nextConfig;
