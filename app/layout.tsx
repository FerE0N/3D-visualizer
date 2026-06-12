import '../globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blender 3D Visualizer',
  description: 'Visor web y conversor para modelos 3D y archivos .blend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet" />
        
        {/* Model Viewer Component */}
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
