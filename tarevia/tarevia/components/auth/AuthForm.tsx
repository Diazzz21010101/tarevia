'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AuthForm({mode}:{mode:'login'|'register'|'recovery'}) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage('');setBusy(true);
    try {
      const supabase=createSupabaseBrowserClient();
      if(!supabase){setMessage('Falta configurar Supabase. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno de Vercel.');return;}
      if(mode==='register'){
        const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${window.location.origin}/app`}});
        if(error) throw error;
        if(data.session){router.push('/app');router.refresh();} else setMessage('Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.');
      } else if(mode==='login'){
        const {error}=await supabase.auth.signInWithPassword({email,password}); if(error)throw error; router.push('/app');router.refresh();
      } else {
        const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/recuperar-contrasena`}); if(error)throw error; setMessage('Si existe una cuenta asociada a ese correo, recibirás instrucciones para recuperar el acceso.');
      }
    } catch(err){setMessage(err instanceof Error?err.message:'No se pudo completar la solicitud. Inténtalo de nuevo.');}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit}>
    {mode==='register'&&<div className="field"><label htmlFor="name">Nombre</label><input id="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Cómo te llamas" autoComplete="name" required maxLength={100}/></div>}
    <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="tu@correo.com" autoComplete="email" required/></div>
    {mode!=='recovery'&&<div className="field"><label htmlFor="password">Contraseña</label><input id="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder={mode==='register'?'Al menos 8 caracteres':'Tu contraseña'} minLength={8} autoComplete={mode==='register'?'new-password':'current-password'} required/></div>}
    {mode==='login'&&<p style={{textAlign:'right',margin:'0 0 10px'}}><Link href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link></p>}
    <button className="button" type="submit" style={{width:'100%'}} disabled={busy}>{busy?'Procesando…':mode==='login'?'Iniciar sesión':mode==='register'?'Crear cuenta':'Enviar instrucciones'}</button>
    {message&&<div className="notice" role="status" style={{marginTop:14}}>{message}</div>}
  </form>;
}
