-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Everyone can read todos
CREATE POLICY "Everyone can read todos" ON public.todos
  FOR SELECT TO public USING (true);

-- Policy for INSERT: Only authorized users can create todos
CREATE POLICY "Only authorized users can create todos" ON public.todos
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for UPDATE: Users can only update their own todos
CREATE POLICY "Users can only update their own todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for DELETE: Users can only delete their own todos
CREATE POLICY "Users can only delete their own todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index for quick searching by user_id
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON public.todos(user_id);

-- Create an index for quick searching by created_at
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON public.todos(created_at DESC);

-- Function for automatic update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic update updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
