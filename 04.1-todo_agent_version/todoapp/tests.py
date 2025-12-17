from __future__ import annotations

from datetime import date
from typing import cast

from django.test import TestCase
from django.urls import reverse
from django.http import HttpResponse

from .models import Todo


class TodoTests(TestCase):

    def test_home_page_loads(self) -> None:
        """Home page should load correctly."""
        response: HttpResponse = self.client.get(reverse("todo_list"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "todoapp/home.html")

    def test_create_todo(self) -> None:
        """Creating a todo via POST should work."""
        response: HttpResponse = self.client.post(reverse("todo_list"), {
            "title": "Test item"
        })
        self.assertRedirects(response, reverse("todo_list"))

        todo: Todo = cast(Todo, Todo.objects.first())
        self.assertIsNotNone(todo)
        self.assertEqual(todo.title, "Test item")
        self.assertFalse(todo.completed)

    def test_toggle_todo(self) -> None:
        """Toggle should flip the completed status."""
        todo: Todo = Todo.objects.create(title="Toggle me")
        url = reverse("toggle_todo", args=[todo.pk])

        # First toggle → completed
        response: HttpResponse = self.client.post(url)
        self.assertEqual(response.status_code, 302)
        todo.refresh_from_db()
        self.assertTrue(todo.completed)

        # Second toggle → not completed
        self.client.post(url)
        todo.refresh_from_db()
        self.assertFalse(todo.completed)

    def test_edit_todo(self) -> None:
        """Editing a todo title and due date should work."""
        todo: Todo = Todo.objects.create(title="Old title")
        url = reverse("edit_todo", args=[todo.pk])

        response: HttpResponse = self.client.post(url, {
            "title": "New title",
            "due_date": "2030-05-12"
        })
        self.assertRedirects(response, reverse("todo_list"))

        todo.refresh_from_db()
        self.assertEqual(todo.title, "New title")
        self.assertEqual(str(todo.due_date), "2030-05-12")

    def test_delete_todo(self) -> None:
        """Deleting a todo via POST should remove it."""
        todo: Todo = Todo.objects.create(title="Delete me")
        url = reverse("delete_todo", args=[todo.pk])

        response: HttpResponse = self.client.post(url)
        self.assertRedirects(response, reverse("todo_list"))
        self.assertEqual(Todo.objects.count(), 0)

    def test_overdue_logic_in_context(self) -> None:
        """Verify that the 'today' value is passed into the home template."""
        response: HttpResponse = self.client.get(reverse("todo_list"))
        self.assertIn("today", response.context)
        self.assertEqual(response.context["today"], date.today())
