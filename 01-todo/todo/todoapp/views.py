from django.shortcuts import get_object_or_404, redirect, render
from .models import Todo


def todo_list(request):
    # Create on POST, otherwise show the list
    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        if title:
            Todo.objects.create(title=title)
        return redirect("todo_list")

    todos = Todo.objects.order_by("-created_at")
    return render(request, "todoapp/home.html", {"todos": todos})


def toggle_todo(request, pk):
    if request.method != "POST":
        return redirect("todo_list")

    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save(update_fields=["completed"])
    return redirect("todo_list")


def edit_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == "POST":
        title = request.POST.get("title", "").strip()
        due_date = request.POST.get("due_date", "").strip()

        # Validate title
        if not title:
            return render(request, "todoapp/edit.html", {
                "todo": todo,
                "error": "Title cannot be empty."
            })

        # Update fields
        todo.title = title

        # Update due date only if provided; "" means remove date
        todo.due_date = due_date if due_date else None

        todo.save()
        return redirect("todo_list")

    return render(request, "todoapp/edit.html", {"todo": todo})


def delete_todo(request, pk):
    if request.method != "POST":
        return redirect("todo_list")

    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("todo_list")
