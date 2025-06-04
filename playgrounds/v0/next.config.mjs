/** @type {import('next').NextConfig} */
const nextConfig = {
  // Включаем standalone для Docker
  output: 'standalone',
  
  // Экспериментальные функции
  experimental: {
    // Включаем App Router (по умолчанию в Next.js 13+)
    appDir: true,
  },
  
  // Настройки для продакшена
  poweredByHeader: false,
  
  // Настройки изображений (если будут использоваться)
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Настройки ESLint и TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
