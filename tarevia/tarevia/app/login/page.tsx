import type {Metadata} from 'next';import Link from 'next/link';import AuthCard from '@/components/AuthCard';import AuthForm from '@/components/auth/AuthForm';
export const metadata:Metadata={title:'Iniciar sesión'};
export default function Page(){return <AuthCard title="Qué bueno verte." description="Inicia sesión para volver a tu espacio académico." footer={<>¿Todavía no tienes cuenta? <Link href="/registro">Crear cuenta</Link></>}><AuthForm mode="login"/></AuthCard>}
