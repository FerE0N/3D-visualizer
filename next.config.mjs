/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  allowedDevOrigins: ['visor-eon.loca.lt'],
  // Habilita la exportación estática de Next.js
  output: 'export',
  // Configura las rutas para que coincidan con el nombre de tu repositorio en GitHub
  basePath: isProd ? '/3D-visualizer' : '',
  assetPrefix: isProd ? '/3D-visualizer/' : '',
  // Desactiva la optimización de imágenes ya que GitHub Pages no tiene servidor Node
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
