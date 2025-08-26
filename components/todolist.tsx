"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useTodoStore } from "@/lib/store";
import { useEffect } from "react";

export default function TodoList() {
  const {
    todos,
    newTodo,
    editingTodo,
    isEditing,
    isLoading,
    user,
    setNewTodo,
    setEditingTodo,
    setIsEditing,
    fetchTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  } = useTodoStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div className="max-w-[600px] mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Todo list</h1>
        <p className="text-muted-foreground">
          {user
            ? "Manage your todos"
            : "View todos (login to create or edit todos)"}
        </p>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Add new todo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                placeholder="Type todo title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
                placeholder="Type todo description"
                rows={3}
              />
            </div>
            <Button onClick={addTodo} className="w-full">
              Add todo
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="relative top-1/2 left-1/2">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <Card key={todo.id} className={todo.completed ? "opacity-75" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {user && (
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() =>
                        toggleTodo(todo.id, todo.completed)
                      }
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3
                        className={`text-lg font-semibold ${todo.completed ? "line-through" : ""}`}
                      >
                        {todo.title}
                      </h3>
                      {todo.completed && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </div>
                    {todo.description && (
                      <p
                        className={`text-muted-foreground mb-3 ${todo.completed ? "line-through" : ""}`}
                      >
                        {todo.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(todo.created_at).toLocaleDateString("en")}
                    </p>
                  </div>
                  {user && (
                    <div className="flex gap-2">
                      <Dialog
                        open={isEditing && editingTodo?.id === todo.id}
                        onOpenChange={setIsEditing}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTodo(todo);
                              setIsEditing(true);
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit todo</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={editingTodo?.title || ""}
                                onChange={(e) =>
                                  setEditingTodo(
                                    editingTodo
                                      ? {
                                        ...editingTodo,
                                        title: e.target.value,
                                      }
                                      : null,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">
                                Description
                              </Label>
                              <Textarea
                                id="edit-description"
                                value={editingTodo?.description || ""}
                                onChange={(e) =>
                                  setEditingTodo(
                                    editingTodo
                                      ? {
                                        ...editingTodo,
                                        description: e.target.value,
                                      }
                                      : null,
                                  )
                                }
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={updateTodo} className="flex-1">
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditingTodo(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {todos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Todos not added</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
