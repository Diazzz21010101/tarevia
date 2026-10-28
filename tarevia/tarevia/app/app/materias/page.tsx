import type {Metadata} from 'next';import AcademicManager from '@/components/app/AcademicManager';
export const metadata:Metadata={title:'Mis materias'};export default function Page(){return <AcademicManager mode="subjects"/>}
