import { ReactNode, useMemo, useState } from "react";
import { useQuery } from "react-query";
import supabaseClient from "supabase/client";
import { Board, Comment, NestedComment, Task } from "../../context/type";
import { useBoards } from "context";

export default function TaskComments({
  taskId,
  taskTitle,
  boardTitle,
}: {
  taskId: Task["id"];
  boardTitle: Board["title"];
  taskTitle: Task["title"];
}) {
  const { currentUser } = useBoards();

  const { data, refetch } = useQuery(
    ["taskComments", taskId],
    async () => {
      const data = await supabaseClient
        .from("Comment")
        .select("*, User(name)")
        .match({ taskId: taskId });

      return data.data;
    },
    {
      enabled: !!taskId,
    }
  );

  const nestedComments = useMemo(() => {
    if (!data) return [];
    return getNestedComments(data, null);
  }, [data]);

  const [currentId, setCurrentId] = useState<Comment["id"] | undefined>(
    undefined
  );

  const TextArea = useMemo(
    () => (
      <div className="block w-full p-2 text-sm bg-gray-450">
        <CommentEditor
          onReply={async (content: string) => {
            const { data, error } = await supabaseClient
              .from("Comment")
              .insert([
                {
                  taskId: taskId,
                  content,
                  userId: currentUser?.id!,
                  parentId: currentId,
                },
              ])
              .select();
            if (data) {
              window.sendMessages?.({
                taskTitle,
                boardTitle,
                message: `add comment to ${taskTitle}`,
              });
              refetch();
            }
          }}
        ></CommentEditor>
      </div>
    ),
    [currentId]
  );

  const onDelete = async (commentId: Comment["id"]) => {
    const { data, error } = await supabaseClient
      .from("Comment")
      .delete()
      .match({ id: commentId });
    if (currentId == commentId) {
      setCurrentId(undefined);
    }
    refetch();
  };

  return (
    <div className="mt-6">
      <h1>TaskComments</h1>
      {TextArea}
      <div>
        {nestedComments.map((c) => (
          <CommentBox
            key={c.id}
            comment={c}
            onReply={setCurrentId}
            currentId={currentId}
            currentUserId={currentUser?.id}
            onDelete={onDelete}
          >
            {TextArea}
          </CommentBox>
        ))}
      </div>
    </div>
  );
}

function CommentBox({
  comment,
  onReply,
  onDelete,
  children,
  currentId,
  currentUserId,
}: {
  comment: NestedComment;
  onReply: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  children?: ReactNode[] | ReactNode;
  currentId?: number;
  currentUserId?: number;
}) {
  return (
    <div className="w-full mt-4 text-gray-1">
      <div className="flex">
        <div>
          <span className="mr-2 text-gray-2">{comment.User?.name}:</span>
        </div>
        <div className="ml-auto text-gray-2">
          {new Date(comment.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex">
        <div
          className={
            "w-4 mr-1 relative left-2" +
            (comment.comments.length > 0 ? " border-gray-2 border-l" : "")
          }
        ></div>
        <div className="py-2 font-normal leading-4">
          <div>{comment.content}</div>
        </div>
      </div>
      <div className="flex">
        <div
          className={
            "w-4 mr-1 relative left-2" +
            (comment.comments.length > 0 ? " border-gray-2 border-l" : "")
          }
        ></div>
        <div className="flex items-center gap-x-2">
          <button
            className="text-sm"
            onClick={() => {
              onReply(comment.id);
            }}
          >
            Reply
          </button>
          {currentUserId == comment.userId && (
            <button
              className="text-sm"
              onClick={() => {
                onDelete(comment.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {currentId == comment.id && (
        <div className="flex">
          <div className="relative w-4 mr-1 border-l border-gray-2 left-2"></div>
          {children}
        </div>
      )}
      {comment.comments.map((child) => (
        <div key={child.id} className="flex">
          <div className="relative w-4 mr-1 border-l border-gray-2 left-2"></div>
          <CommentBox
            comment={child}
            onReply={onReply}
            currentId={currentId}
            onDelete={onDelete}
            currentUserId={currentUserId}
          >
            {children}
          </CommentBox>
        </div>
      ))}
    </div>
  );
}

function NoComments() {
  return (
    <div className="pt-6 pb-8 text-center">
      <svg
        width="102"
        height="102"
        viewBox="0 0 102 102"
        className="mx-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.7"
          d="M32 25H83V61.8182H70.25H63.875L57.5 69L51.125 61.8182H44.75H32V25Z"
          fill="url(#paint0_linear_1096_5489)"
        />
        <path
          d="M22 35H73V71.8182H60.25H53.875L47.5 79L41.125 71.8182H34.75H22V35Z"
          fill="url(#paint1_linear_1096_5489)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M44 45V49.0909V63H56C57.1046 63 58 62.1046 58 61V51.0909C58 49.9863 57.1046 49.0909 56 49.0909H48.9412V47C48.9412 45.8954 48.0457 45 46.9412 45H44ZM42 49H37V63H42V49Z"
          fill="#1B1B22"
        />
        <defs>
          <linearGradient
            id="paint0_linear_1096_5489"
            x1="57.5"
            y1="25"
            x2="57.5"
            y2="69"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#45454D" />
            <stop offset="0.861101" stopColor="#2F2F39" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_1096_5489"
            x1="47.5"
            y1="35"
            x2="47.5"
            y2="79"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#45454D" />
            <stop offset="0.861101" stopColor="#2F2F39" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-[#676773] text-sm font-bold">
        Be the first to let them know your thoughts!
      </div>
    </div>
  );
}

function NestedCommentItem({ comment }: { comment: NestedComment }) {
  return (
    <div>
      <div>{comment.content}</div>
      <div>
        {comment.comments.map((c) => (
          <NestedCommentItem key={c.id} comment={c} />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div>
      <div>{comment.content}</div>
    </div>
  );
}

function CommentEditor({ onReply }: { onReply: (content: string) => void }) {
  const [content, setContent] = useState<string>("");

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
        }}
        className="w-full p-2 border rounded-md"
      />
      <div className="flex justify-end">
        <button
          onClick={() => {
            onReply(content);
            setContent("");
          }}
          className="px-4 py-2 mt-2 text-sm font-bold text-white bg-blue-500 rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function getNestedComments(
  comments: Comment[],
  parentId: Comment["id"] | null
): NestedComment[] {
  return comments
    .filter((c) => c.parentId === parentId)
    .map((c) => ({
      ...c,
      comments: getNestedComments(comments, c.id),
    }));
}
