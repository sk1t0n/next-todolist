import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  user_id?: string;
}

interface TodoState {
  todos: Todo[];
  newTodo: { title: string; description: string };
  editingTodo: Todo | null;
  isEditing: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;

  setTodos: (todos: Todo[]) => void;
  setNewTodo: (todo: { title: string; description: string }) => void;
  setEditingTodo: (todo: Todo | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;

  fetchUser: () => Promise<void>;
  fetchTodos: () => Promise<void>;
  addTodo: () => Promise<void>;
  updateTodo: () => Promise<void>;
  toggleTodo: (id: number, completed: boolean) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  newTodo: { title: "", description: "" },
  editingTodo: null,
  isEditing: false,
  isLoading: false,
  error: null,
  user: null,

  setTodos: (todos) => set({ todos }),
  setNewTodo: (newTodo) => set({ newTodo }),
  setEditingTodo: (editingTodo) => set({ editingTodo }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setUser: (user) => set({ user }),

  fetchUser: async () => {
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      set({ user });
    } catch {
      set({ user: null });
    }
  },

  fetchTodos: async () => {
    set({ isLoading: true });
    await get().fetchUser();

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        set({ error: error.message });
      } else {
        set({ todos: data || [], error: null });
      }
    } catch {
      set({ error: "Failed to fetch todos" });
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async () => {
    const { newTodo, user } = get();
    if (!newTodo.title.trim() || !user) return;

    set({ isLoading: true });
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            title: newTodo.title,
            description: newTodo.description,
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        set({ error: error.message });
      } else if (data?.[0]) {
        set((state) => {
          const todos = [...state.todos, data[0]];
          const sortedTodosById = todos.sort((a, b) => b.id - a.id);
          return { todos: sortedTodosById };
        });
        set({ newTodo: { title: "", description: "" }, error: null });
      }
    } catch {
      set({ error: "Failed to add todo" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTodo: async () => {
    const { editingTodo } = get();
    if (!editingTodo) return;

    set({ isLoading: true });
    const supabase = createClient();
    try {
      const todoForUpdate = {
        title: editingTodo.title,
        description: editingTodo.description,
      };
      const { error } = await supabase
        .from("todos")
        .update(todoForUpdate)
        .eq("id", editingTodo.id);

      if (error) {
        set({ error: error.message });
      } else {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === editingTodo.id ? { ...todo, ...todoForUpdate } : todo,
          ),
        }));
        set({ editingTodo: null, isEditing: false, error: null });
      }
    } catch {
      set({ error: "Failed to update todo" });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleTodo: async (id: number, completed: boolean) => {
    set({ isLoading: true });
    const supabase = createClient();
    try {
      const todoForUpdate = { completed: !completed };
      const { error } = await supabase
        .from("todos")
        .update(todoForUpdate)
        .eq("id", id);

      if (error) {
        set({ error: error.message });
      } else {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...todoForUpdate } : todo,
          ),
        }));
        set({ error: null });
      }
    } catch {
      set({ error: "Failed to update todo" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTodo: async (id: number) => {
    set({ isLoading: true });
    const supabase = createClient();
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        set({ error: error.message });
      } else {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
        set({ error: null });
      }
    } catch {
      set({ error: "Failed to delete todo" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
