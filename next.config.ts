import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nvme-ssd-portfolio-",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
