import os
import subprocess
import requests

import click
from flask.cli import FlaskGroup

from src import create_app, db
from src.blueprints.profiles.models import Profile
from src.blueprints.auth.models import User

app = create_app()
cli = FlaskGroup(create_app=create_app)


@cli.command()
@click.argument("path", default="app")
def cov(path):
    """
    Run a test coverage report.

    :param path: Test coverage path
    :return: Subprocess call result
    """
    cmd = f"py.test --cov-report term-missing --cov {path}"
    return subprocess.call(cmd, shell=True)


@cli.command()
@click.option(
    "--skip-init/--no-skip-init",
    default=True,
    help="Skip __init__.py files?"
)
@click.argument("path", default="app")
def flake8(skip_init, path):
    """
    Run flake8 to analyze your code base.

    :param skip_init: Skip checking __init__.py files
    :param path: Path to directory that flake8 would inspect
    :return: Subprocess call result
    """
    flake8_flag_exclude = ""

    if skip_init:
        flake8_flag_exclude = " --exclude __init__.py"

    cmd = f"flake8 {path}{flake8_flag_exclude} --ignore E128 E402 f401"
    return subprocess.call(cmd, shell=True)


@cli.command()
@click.argument('path', default=os.path.join('src', 'tests'))
def test(path):
    """
    Run tests with Pytest.

    :param path: Test path
    :return: Subprocess call result
    """
    cmd = 'py.test {0}'.format(path)
    return subprocess.call(cmd, shell=True)


@cli.command()
def db_init():
    """Initialize the database."""
    db.drop_all()
    db.create_all()
    db.session.commit()
    print("Database was successfully initialized...")
    return None


@click.argument("num_of_users", default=100)
@cli.command()
def seed_users(num_of_users):
    """
    Seed the database with users.
    :param num_of_users: Number of users to seed the
    database with, default is 50.
    """
    try:
        data = requests.get(
            'https://randomuser.me/api/?'
            f'results={num_of_users}'
            '&inc=name,email,login,picture,dob,location,nat'
        ).json()

        for user in data.get('results'):
            u = User(password='password')
            u.firstname = user.get('name')['first']
            u.lastname = user.get('name')['last']
            u.username = user.get('login')['username']
            u.email = user.get('email')
            u.avatar = user.get('picture')['thumbnail']

            u.profile = Profile()
            u.profile.bio = f"Hi, my name is {user.get('name')['first']} \
                and I live in {user.get('location')['city']} \
                {user.get('location')['state']}, {user.get('nat')}. I am \
                {user.get('dob')['age']} yrs old, and I love to code."
            u.save()

        print(f'Database seeded  with {num_of_users} users...')
    except Exception as error:
        print(f'Error: {error}')


if __name__ == '__main__':
    cli()
