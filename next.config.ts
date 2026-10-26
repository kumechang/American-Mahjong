import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Stray URLs seen in Search Console (http://mahjong-map.com/$, /&): a trailing character stuck to a link somewhere else.
  async redirects() {
    return [
      { source: "/:junk([&$]+)", destination: "/", permanent: true },
      { source: "/:junk((?:%24|%26)+)", destination: "/", permanent: true }, // the same characters, percent-encoded
    ];
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
