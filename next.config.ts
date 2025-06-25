import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'http2.mlstatic.com', 
      'nexum.com.ar', 
    ],
  },
};

export default nextConfig;
