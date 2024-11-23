/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fsvtdkrshgwpisxrhhkn.supabase.co",
        pathname: "/",
      },
    ],
  },
};

export default nextConfig;
