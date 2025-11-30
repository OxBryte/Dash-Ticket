'use client'

import { useQuery } from '@tanstack/react-query'

interface Todo {
  id: number
  title: string
  completed: boolean
}

export default function ExampleQuery() {
  const { data, isLoading, error } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error loading todos</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data?.map((todo) => (
        <div
          key={todo.id}
          className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm"
        >
          <p className="text-gray-900 dark:text-white">
            {todo.id}. {todo.title}
          </p>
          <span
            className={`text-xs ${
              todo.completed
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}
          >
            {todo.completed ? '✓ Completed' : '○ Pending'}
          </span>
        </div>
      ))}
    </div>
  )
}

