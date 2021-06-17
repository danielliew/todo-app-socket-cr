import { v4 } from "uuid";

interface TodoReply {
  id?: string;
  todoCommentId: string;
  username: string;
  reply: string;
  timestamp: string;
}

interface TodoComment {
  id?: string;
  comment: string;
  username: string;
  timestamp: string;
  todoId: string;
}

interface TodoCommentWithReply extends TodoComment {
  replies: TodoReply[];
}

export class FakeTodoDb {
  commentstore: TodoComment[] = [
    {
      id: "C001",
      comment: "Do i really need this",
      username: "dan",
      timestamp: "today",
      todoId: "0",
    },
  ];

  replystore: TodoReply[] = [
    {
      id: "R001",
      todoCommentId: "C001",
      username: "boss",
      reply: "Yes you do",
      timestamp: "today",
    },
  ];

  constructor() {}

  select(id?: string | undefined) {
    if (id === undefined)
      return this.commentstore.map((c) => ({
        ...c,
        replies: this.replystore.filter((r) => r.todoCommentId === c.id),
      }));
    const find = this.commentstore
      .filter((c) => c.id === id)
      .map((c) => ({
        ...c,
        replies: this.replystore.filter((r) => r.todoCommentId === c.id),
      }));
    return find.length ? find : [];
  }

  comment(t: TodoComment) {
    try {
      this.commentstore.push({
        id: v4(),
        comment: t.comment,
        username: t.username,
        timestamp: new Date().toLocaleString(),
        todoId: t.todoId,
      });
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  reply(t: TodoReply) {
    try {
      this.replystore.push({
        id: v4(),
        reply: t.reply,
        username: t.username,
        todoCommentId: t.todoCommentId,
        timestamp: new Date().toLocaleString(),
      });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  updateComment(tc: TodoComment, id: string) {
    try {
      let success = false;
      this.commentstore = this.commentstore.map((s) => {
        if (s.id === id) {
          success = true;
          return tc;
        }
        return s;
      });
      return { success };
    } catch (error) {
      return { success: false };
    }
  }

  updateReply(tr: TodoReply, id: string) {
    try {
      let success = false;
      this.replystore = this.replystore.map((s) => {
        if (s.id === id) {
          success = true;
          return tr;
        }
        return s;
      });
      return { success };
    } catch (error) {
      return { success: false };
    }
  }

  deleteComment(id: string) {
    try {
      let success = false;
      this.commentstore = this.commentstore.filter((s) => {
        if (s.id === id) {
          success = true;
          return false;
        }
        return true;
      });
      return { success };
    } catch (error) {
      return { success: false };
    }
  }

  deleteReply(id: string) {
    try {
      let success = false;
      this.replystore = this.replystore.filter((s) => {
        if (s.id === id) {
          success = true;
          return false;
        }
        return true;
      });
      return { success };
    } catch (error) {
      return { success: false };
    }
  }
}
