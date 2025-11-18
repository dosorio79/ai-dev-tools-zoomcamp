## Question 1: Install Django
We want to install Django. Ask AI to help you with that.

What's the command you used for that?
- Create the virtual environment with uv
`uv venv and then source .venv/bin/activate`
- Install django
uv pip install django

There could be multiple ways to do it. Put the one that AI suggested in the homework form.

## Question 2: Project and App
Now we need to create a project and an app for that.

Follow the instructions from AI to do it. At some point, you will need to include the app you created in the project.

What's the file you need to edit for that?

-> settings.py
manage.py
urls.py
wsgi.py

Question 3: Django Models
Let's now proceed to creating models - the mapping from python objects to a relational database.

For the TODO app, which models do we need? Implement them.
Simple model for todo with title, boolena completed or not and date field for when

What's the next step you need to take?

Run the application
Add the models to the admin panel
-> Run migrations
Create a makefile

python manage.py makemigrations
python manage.py migrate
