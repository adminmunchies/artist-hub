// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Erhöht das Upload-Limit für Server Actions (Default 1 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // bei Bedarf größer/kleiner setzen
    },
  },

  // Erlaubt Bilder aus deinem Supabase-Storage in <img>/<Image>
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nhfyxtdbspqbjahpgkxx.supabase.co', // dein Projekt
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
