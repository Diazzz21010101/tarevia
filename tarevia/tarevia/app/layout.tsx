import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:{default:'Tarevia | Organiza tu vida académica',template:'%s | Tarevia'},description:'Organiza tareas, trabajos, evaluaciones y sesiones de estudio en un solo lugar.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tarevia.net'),openGraph:{title:'Tarevia',description:'Organiza tus tareas. Planifica tu tiempo. Avanza a tu ritmo.',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
