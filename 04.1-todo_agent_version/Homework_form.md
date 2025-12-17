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

## Question 3: Django Models
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

## Question 4. TODO Logic
Let's now ask AI to implement the logic for the TODO app. Where do we put it?

-> views.py
urls.py
admin.py
tests.py

## Question 5. Templates
Next step is creating the templates. You will need at least two: the base one and the home one. Let's call them base.html and home.html.
Where do you need to register the directory with the templates?

INSTALLED_APPS in project's settings.py
-> TEMPLATES['DIRS'] in project's settings.py
TEMPLATES['APP_DIRS'] in project's settings.py
In the app's urls.py

###  Question 6. Tests
Now let's ask AI to cover our functionality with tests.

Ask it which scenarios we should cover
Make sure they make sense
Let it implement it and run them
Probably it will require a few iterations to make sure that tests pass and evertyhing is working.

What's the command you use for running tests in the terminal?

pytest
-> python manage.py test
python -m django run_tests
django-admin test