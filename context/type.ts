import { Database } from "supabase/types";

export type Board = Database["public"]["Tables"]["Board"]["Row"];
export type BoardInsert = Database["public"]["Tables"]["Board"]["Insert"];

export type Column = Database["public"]["Tables"]["Column"]["Row"];
export type ColumnInsert = Database["public"]["Tables"]["Column"]["Insert"];

export type Task = Database["public"]["Tables"]["Task"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["Task"]["Insert"];

export type Todo = Database["public"]["Tables"]["ToDo"]["Row"];
export type TodoUpdate = Database["public"]["Tables"]["ToDo"]["Update"];

export type TodoInsert = Database["public"]["Tables"]["ToDo"]["Insert"];

export type Comment = Database["public"]["Tables"]["Comment"]["Row"] & {
  User: {
    name: string | null;
  } | null;
};
export type CommentUpdate = Database["public"]["Tables"]["Comment"]["Update"];
export type CommentInsert = Database["public"]["Tables"]["Comment"]["Insert"];

export type User = Database["public"]["Tables"]["User"]["Row"];
export type UserUpdate = Database["public"]["Tables"]["User"]["Update"];
export type UserInsert = Database["public"]["Tables"]["User"]["Insert"];

export type NestedComment = Comment & {
  comments: NestedComment[];
};

export type TaskWithTodos = Task & {
  todos: Todo[];
};
