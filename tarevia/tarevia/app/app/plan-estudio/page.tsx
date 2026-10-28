import type {Metadata} from 'next';import AcademicManager from '@/components/app/AcademicManager';
export const metadata:Metadata={title:'Plan de estudio'};export default function Page(){return <AcademicManager mode="sessions"/>}
