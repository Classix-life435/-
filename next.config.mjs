/** @type {import('next').NextConfig} */

// GitHub Pages（プロジェクトページ）へデプロイする際は GITHUB_PAGES=true を設定。
// リポジトリ名が basePath になる（例: https://<owner>.github.io/-/）。
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "-"; // リポジトリ名

const nextConfig = {
  reactStrictMode: true,
  // 静的サイトとして書き出し（サーバー不要・どこでもホスティング可能）
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isPages ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
