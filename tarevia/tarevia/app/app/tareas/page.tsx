import type {Metadata} from 'next';import TaskManager from '@/components/app/TaskManager';
export const metadata:Metadata={title:'Mis tareas'};
export default function Page(){return <TaskManager/>}
