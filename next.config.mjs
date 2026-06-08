/** @type {import('next').NextConfig} */

// GitHub Pages（プロジェクトページ）へデプロイする際は GITHUB_PAGES=true を設定。
// リポジトリ名が basePath になる（例: https://<owner>.github.io/<repo>/）。
// CI では GITHUB_REPOSITORY（"owner/repo"）からリポジトリ名を自動取得するため、
// リポジトリ名をハードコードする必要がない。
const isPages = process.env.GITHUB_PAGES === "true";
const repo = (process.env.GITHUB_REPOSITORY || "/-").split("/")[1];

const nextConfig = {
  reactStrictMode: true,
  // 静的サイトとして書き出し（サーバー不要・どこでもホスティング可能）
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isPages ? { basePath: `/${repo}`, assetPrefix: `/${repo}/` } : {}),
};

export default nextConfig;
