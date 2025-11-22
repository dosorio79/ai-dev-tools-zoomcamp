from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from datetime import date

def todo_list(request):
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        if title:
            Todo.objects.create(title=title)
        return redirect("todo_list")

    todos = Todo.objects.order_by("-created_at")
    return render(request, "todoapp/home.html", {
        "todos": todos,
        "today": date.today(),   # ← ADD THIS
    })


def toggle_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save(update_fields=["completed"])
    return redirect("todo_list")


def delete_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("todo_list")


def edit_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        due_date = request.POST.get("due_date", "").strip()

        if title:
            todo.title = title
        if due_date:
            todo.due_date = due_date

        todo.save()
        return redirect("todo_list")

    return render(request, "todoapp/edit.html", {"todo": todo})
