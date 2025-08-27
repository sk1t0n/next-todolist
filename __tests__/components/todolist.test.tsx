import { render, screen } from "@testing-library/react";
import TodoList from "@/components/todolist";
import { useTodoStore } from "../../lib/store";

jest.mock("../../lib/store", () => {
  const testTodos = [
    {
      id: 1,
      title: "Todo 1",
      description: "",
      completed: false,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  let user: any = null;
  const mock = {
    useTodoStore: () => ({
      todos: testTodos,
      newTodo: { title: "", description: "" },
      user,
      fetchUser: () => {},
      fetchTodos: () => {
        return testTodos;
      },
      setUser(newUser: any) {
        user = newUser;
      },
    }),
  };

  return mock;
});

describe("TodoList", () => {
  it("check snapshot", () => {
    const { asFragment } = render(<TodoList />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("show text and todos for guest", () => {
    render(<TodoList />);

    expect(screen.getByText("Todo list")).toBeInTheDocument();
    expect(
      screen.getByText("View todos (login to create or edit todos)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Todo 1")).toBeInTheDocument();
  });

  it("show text for authenticated user", () => {
    const { setUser } = useTodoStore();
    const user = {
      id: "1",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      email: "test@example.com",
      created_at: "2025-01-01T00:00:00Z",
    };
    setUser(user);
    render(<TodoList />);

    expect(screen.getByText("Todo list")).toBeInTheDocument();
    expect(screen.getByText("Manage your todos")).toBeInTheDocument();
  });
});
