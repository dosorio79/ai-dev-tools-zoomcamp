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
    return render(request, "todoapp/list.html", {"todos": todos})


def toggle_todo(request, pk):
    if request.method != "POST":
        return redirect("todo_list")

    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save(update_fields=["completed"])
    return redirect("todo_list")


def delete_todo(request, pk):
    if request.method != "POST":
        return redirect("todo_list")

    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("todo_list")
