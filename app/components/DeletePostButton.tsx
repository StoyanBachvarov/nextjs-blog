'use client';
import { deletePostAction } from '@/app/actions';

export default function DeleteButton({ id }: { id: number }) {
  return (
    <button 
      onClick={() => deletePostAction(id)}
      className="text-red-500 hover:text-red-700 text-sm font-medium"
    >
      Delete
    </button>
  );
}