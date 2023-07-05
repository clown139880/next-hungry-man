import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import stringToSlug from "lib/utils/stringToSlug";
import {
  Board,
  BoardInsert,
  Column,
  ColumnInsert,
  Task,
  TaskWithTodos,
  Todo,
  TodoInsert,
  TodoUpdate,
  User,
} from "./type";
import supabaseClient from "supabase/client";
import { useQuery } from "react-query";
import {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  RealtimePostgresChangesPayload,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { DropResult } from "react-beautiful-dnd";
import useLocalStorage from "lib/hooks/useLocalStorage";

const BoardContext = createContext<{
  currentBoard?: Board & {
    columns: Column[];
  };
  boards?: (Board & {
    columns: Column[];
  })[];
  columnTasksMap: Map<Column, TaskWithTodos[]>;
  createTask?: (taskDraft: {
    title: string;
    columnId: Column["id"];
    todos: Todo[];
    description: string;
  }) => void;
  updateTask?: (
    values: Task & {
      todos: Todo[];
    }
  ) => void;
  updateTodo?: (values: TodoUpdate) => void;
  deleteTask?: (taskId: Task["id"]) => void;
  dragTask?: (result: DropResult) => void;
  setActiveBoard?: (index: number) => void;
  createBoard?: (
    boardDraft: BoardInsert & {
      columns: string[];
    }
  ) => void;
  updateBoard?: (
    values: Board & {
      columns: Column[];
    }
  ) => void;
  currentUser?: User | null;
  login?: (values: { name: string }) => void;
}>({
  boards: [],
  columnTasksMap: new Map(),
});

function BoardProvider({ children }: { children: React.ReactNode }) {
  const [activeBoard, setActiveBoard] = useState(0);

  const { data: boards, refetch: refetchBoards } = useQuery(
    ["boards"],
    async () => {
      const boards = await supabaseClient.from("Board").select("*, Column(*)");

      return boards.data;
    },
    {
      select(data) {
        return data?.map((board) => ({
          ...board,
          columns: board.Column,
        }));
      },
    }
  );

  const currentBoard = boards?.[activeBoard];

  const [tasks, setTasks] = useState<TaskWithTodos[]>([]);

  useQuery(
    ["tasks", currentBoard?.id],
    async () => {
      const tasks = await supabaseClient
        .from("Task")
        .select("*, ToDo(*)")
        .match({ boardId: currentBoard?.id });

      return tasks.data;
    },
    {
      enabled: !!currentBoard,
      onSuccess(data) {
        if (data) {
          setTasks(
            data.map(({ ToDo, ...task }) => {
              return {
                ...task,
                todos: ToDo,
              };
            })
          );
        }
      },
    }
  );

  useEffect(() => {
    if (!currentBoard) {
      return;
    }
    console.log("currentBoard", currentBoard);
    const tasksChannel = supabaseClient
      .channel("realtime:public:Task:boardId=eq." + currentBoard.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Task",
          filter: "boardId=eq." + currentBoard.id,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          console.log("Change received!", payload);

          switch (payload.eventType) {
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT:
              const task = payload.new as Task;
              setTasks((prev) => [
                ...prev,
                {
                  ...task,
                  todos: [],
                },
              ]);
              break;
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE:
              const updatedTask = payload.new as Task;
              const oldTask = payload.old as Task;

              setTasks((prev) => {
                return [
                  ...prev.map((task) => {
                    if (task.id === oldTask.id) {
                      return {
                        ...task,
                        ...updatedTask,
                      };
                    }
                    return task;
                  }),
                ];
              });

              break;
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE:
              const deleteTask = payload.old as Task;
              setTasks((prev) => {
                return [...prev.filter((task) => task.id !== deleteTask.id)];
              });
              break;
            default:
              break;
          }
        }
      )
      .subscribe();
    console.log(tasksChannel.state);

    const todosChannel = supabaseClient
      .channel(`realtime:public:Todo:${currentBoard?.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ToDo",
          // filter: "boardId=eq." + currentBoard.id,
        },
        (payload: RealtimePostgresChangesPayload<Todo>) => {
          console.log("Change received!", payload);
          switch (payload.eventType) {
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT:
              const subTask = payload.new;

              setTasks((prev) => {
                return [
                  ...prev.map((task) => {
                    if (task.id === subTask.taskId) {
                      return {
                        ...task,
                        todos: [...task.todos, subTask],
                      };
                    }
                    return task;
                  }),
                ];
              });

              break;
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE:
              const updatedSubTask = payload.new;
              setTasks((prev) => {
                return [
                  ...prev.map((task) => {
                    if (task.id === updatedSubTask.taskId) {
                      return {
                        ...task,
                        todos: [
                          ...task.todos.map((todo) => {
                            if (todo.id === updatedSubTask.id) {
                              return updatedSubTask;
                            }
                            return todo;
                          }),
                        ],
                      };
                    }
                    return task;
                  }),
                ];
              });

              break;
            case REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE:
              const deletedTask = payload.old;

              setTasks((prev) => {
                return [
                  ...prev.map((task) => {
                    if (task.id === deletedTask.taskId) {
                      return {
                        ...task,
                        todos: [
                          ...task.todos.filter((todo) => {
                            return todo.id !== deletedTask.id;
                          }),
                        ],
                      };
                    }
                    return task;
                  }),
                ];
              });
              break;
            default:
              break;
          }
        }
      )
      .subscribe();

    return () => {
      tasksChannel.unsubscribe();
      todosChannel.unsubscribe();
    };
  }, [currentBoard?.id]);

  const createTask = async (taskDraft: {
    title: string;
    columnId: Column["id"];
    todos: Todo[];
    description: string;
  }) => {
    const column =
      currentBoard?.columns.find(
        (column) => column.id === taskDraft.columnId
      )! ?? currentBoard?.columns?.[0];

    const { data, error } = await supabaseClient
      .from("Task")
      .insert([
        {
          title: taskDraft.title,
          columnId: column.id,
          content: taskDraft.description,
          boardId: column.boardId,
        },
      ])
      .select();

    const taskId = (data as any)?.[0].id;

    if (taskId) {
      const { data, error } = await supabaseClient.from("ToDo").insert(
        taskDraft.todos.map((subtask) => ({
          content: subtask.content,
          taskId,
          boardId: column.boardId,
          isDone: false,
        }))
      );
    }
  };

  const createColumn = async (column: ColumnInsert) => {
    const { data, error } = await supabaseClient
      .from("Column")
      .insert([column]);

    refetchBoards();
  };

  const createBoard = async ({
    columns,
    ...boardDraft
  }: BoardInsert & {
    columns: string[];
  }) => {
    const { data, error } = await supabaseClient
      .from("Board")
      .insert(boardDraft)
      .select();

    if (data && columns.length) {
      const newColumns: ColumnInsert[] = columns.map((columnName, i) => {
        return {
          title: columnName,
          boardId: data[0].id,
        };
      });

      const { data: columnData, error } = await supabaseClient
        .from("Column")
        .insert(newColumns)
        .select();
      await refetchBoards();

      if (columnData) {
        const columnId = columnData[0].id;

        if (boardDraft.jiraId) {
          const issues: any = await fetch(
            "/api/issue?id=" + boardDraft.jiraId
          ).then((res) => res.json());

          issues.tables.forEach((t: any) => {
            t.tables.forEach((t: any) => {
              t.rows.forEach(async (r: any) => {
                await createTask({
                  title: r[1].slice(0, 128),
                  description: r[1],
                  columnId: columnId,
                  todos: [],
                });
              });
            });
          });
        }
      }
    }
  };

  const onTaskUpdateLocal = (task: Task) => {
    setTasks((prev) => {
      return [
        ...prev.map((t) => {
          if (t.id === task.id) {
            return {
              ...t,
              ...task,
            };
          }
          return t;
        }),
      ];
    });
  };

  const updateTask = async ({
    todos,
    ...newTask
  }: Task & {
    todos: Todo[];
  }) => {
    const currentTask = {
      ...tasks.find((t) => t.id === newTask.id),
    };

    if (newTask.columnId !== currentTask.columnId) {
      window.sendMessages?.({
        taskTitle: newTask.title,
        boardTitle: currentBoard?.title ?? "unknown",
        message: `moved to ${
          currentBoard?.columns.find((c) => c.id === newTask.columnId)?.title ??
          "unknown"
        }`,
      });
    } else {
      window.sendMessages?.({
        taskTitle: newTask.title,
        boardTitle: currentBoard?.title ?? "unknown",
        message: `updated`,
      });
    }

    onTaskUpdateLocal(newTask);
    await supabaseClient.from("Task").update(newTask).eq("id", newTask.id);

    const updatePromises: Promise<any>[] = todos.map(async (subtask) => {
      const updatedSubtask = currentTask?.todos?.find(
        (s) => s.id === subtask.id
      );
      if (!updatedSubtask) {
        // create new subtask
        await supabaseClient.from("ToDo").insert({
          ...subtask,
          taskId: newTask.id,
          boardId: newTask.boardId,
          isDone: false,
          id: undefined,
        } as TodoInsert);
      } else if (updatedSubtask.content != subtask.content) {
        await supabaseClient
          .from("ToDo")
          .update({
            content: updatedSubtask.content,
          })
          .eq("id", subtask.id);
      }
    });

    updatePromises.push(
      ...(currentTask?.todos
        ?.filter((s) => !todos.find((t) => t.id === s.id))
        .map(async (subtask) => {
          return await supabaseClient
            .from("ToDo")
            .delete()
            .eq("id", subtask.id);
        }) ?? [])
    );

    await Promise.all(updatePromises);
  };

  const updateBoard = async ({
    columns,
    ...updatedBoard
  }: Board & {
    columns: Column[];
  }) => {
    await Promise.all(
      currentBoard!.columns.map(async (column, index) => {
        const updatedColumn = columns.find((c) => c.id === column.id);
        if (!updatedColumn) {
          await supabaseClient.from("Column").delete().eq("id", column.id);
        } else if (updatedColumn.title != column.title) {
          console.log("updatedColumn", updatedColumn);

          await supabaseClient
            .from("Column")
            .update({
              title: updatedColumn.title,
            })
            .eq("id", column.id);
        }
      })
    );

    const newColumns = columns
      .filter((c) => {
        return !c.id;
      })
      .map((column) => {
        return {
          title: column.title,
          boardId: currentBoard!.id,
        } as ColumnInsert;
      });

    if (newColumns.length)
      await supabaseClient.from("Column").insert(newColumns);

    if (updatedBoard.title != currentBoard!.title) {
      await supabaseClient
        .from("Board")
        .update({
          title: updatedBoard.title,
        })
        .eq("id", updatedBoard.id);
    }

    refetchBoards();
  };

  const updateTodo = async (todo: TodoUpdate) => {
    await supabaseClient.from("ToDo").update(todo).eq("id", todo.id);
  };

  const deleteTask = async (taskId: Task["id"]) => {
    console.log("delete", taskId);
    await supabaseClient.from("ToDo").delete().match({ taskId: taskId });
    await supabaseClient.from("Task").delete().match({ id: taskId });
  };

  const deleteBoard = async (boardId: Board["id"]) => {
    setActiveBoard(0);
    await supabaseClient.from("ToDo").delete().match({ boardId: boardId });
    await supabaseClient.from("Task").delete().match({ boardId: boardId });
    await supabaseClient.from("Column").delete().match({ boardId: boardId });
    await supabaseClient.from("Board").delete().match({ id: boardId });
    refetchBoards();
  };

  const dragTask = ({ destination, source, draggableId }: DropResult) => {
    // dropped outside a column
    if (!destination) {
      return;
    }

    // if the source and destination are the same, do nothing
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // If the card is moved within the same column and just needs an index change
    if (source.droppableId === destination.droppableId) {
      // setTasks((prev) => {
      //   const newTasks: typeof prev = [...prev];
      //   const [removed] = newTasks.splice(source.index, 1);
      //   newTasks.splice(destination.index, 0, removed);
      //   return newTasks;
      // });
    }
    //If the card has been moved to a different column
    else {
      const draggedTask = tasks.find((t) => t.id.toString() === draggableId);

      if (!draggedTask) return;

      updateTask({ ...draggedTask, columnId: Number(destination.droppableId) });
    }
  };

  const columnTasksMap = useMemo(() => {
    const columnTasksMap = new Map<Column, TaskWithTodos[]>();
    tasks.forEach((task) => {
      const column = currentBoard?.columns.find(
        (c) => c.id === task.columnId
      ) as Column;
      if (!columnTasksMap.has(column)) {
        columnTasksMap.set(column, []);
      }
      columnTasksMap.get(column)?.push(task);
    });
    return columnTasksMap;
  }, [tasks, currentBoard?.columns]);

  const [currentUser, setCurrentUser] = useLocalStorage<User>(
    "currentUser",
    null
  );

  const login = async ({ name }: { name: string }) => {
    const { data, error } = await supabaseClient
      .from("User")
      .upsert({
        id: currentUser?.id,
        name: name,
      })
      .select();

    if (data) {
      setCurrentUser(data[0]);
    }
  };

  const value = {
    boards,
    columnTasksMap,
    currentBoard,
    createBoard,
    createColumn,
    updateTodo,
    createTask,
    updateTask,
    updateBoard,
    deleteTask,
    deleteBoard,
    dragTask,
    setActiveBoard,
    login,
    currentUser,
  };
  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

const useBoards = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoards must be used within a BoardProvider");
  }
  return context;
};

export { BoardProvider, useBoards };
