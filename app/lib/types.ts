export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Personal' | 'Study' | 'Work' | 'Health';

export type Todo = {
  id: number;
  title: string;
  note: string;
  completed: number;
  priority: Priority;
  category: Category;
  due_date: string;
  created_at: string;
};

export type TodoInput = Omit<Todo, 'id' | 'completed' | 'created_at'>;
