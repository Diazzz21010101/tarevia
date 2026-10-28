import type {Metadata} from 'next';import Link from 'next/link';import AuthCard from '@/components/AuthCard';import AuthForm from '@/components/auth/AuthForm';
export const metadata:Metadata={title:'Crear cuenta'};
export default function Page(){return <AuthCard title="Tu organización empieza aquí." description="Crea tu cuenta para preparar tu espacio académico." footer={<>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></>}><AuthForm mode="register"/></AuthCard>}
