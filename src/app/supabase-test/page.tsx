import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // This is a test query to check the connection
  const { data: todos, error } = await supabase.from('todos').select()

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4 text-cyan-400">Supabase Connection Test</h1>
      
      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Error: {error.message}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-emerald-400">Successfully connected to Supabase!</p>
          <ul className="list-disc pl-5 space-y-2">
            {todos?.map((todo: any) => (
              <li key={todo.id} className="text-slate-300">
                {todo.name || todo.title || 'Untitled Todo'}
              </li>
            ))}
            {todos?.length === 0 && (
              <li className="text-slate-500 italic">No todos found in the table.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
