import type {Metadata} from 'next';import Link from 'next/link';import AuthCard from '@/components/AuthCard';import AuthForm from '@/components/auth/AuthForm';
export const metadata:Metadata={title:'Recuperar contraseña'};
export default function Page(){return <AuthCard title="Recupera tu acceso." description="Introduce el correo asociado a tu cuenta para solicitar instrucciones de recuperación." footer={<>¿Recordaste tu contraseña? <Link href="/login">Volver a iniciar sesión</Link></>}><AuthForm mode="recovery"/></AuthCard>}
