import os
import subprocess
import datetime
import random
import requests

import click
from sqlalchemy import exc
from flask.cli import FlaskGroup

from src import create_app, db
from src.utils.perms import set_model_perms
from src.blueprints.auth.models import User
from src.blueprints.profiles.models import Profile
from src.blueprints.posts.models import Post, Comment
from src.blueprints.admin.models import Group
from src.blueprints.admin.models import Permission
from src.blueprints.admin.models import grp_members, grp_perms
from src.blueprints.auth.models import user_perms

app = create_app()
cli = FlaskGroup(create_app=create_app)


def random_timestamp(start, end):
    return random.random() * (end - start) + start


@cli.command()
@click.argument("path", default="src")
def cov(path):
    """
    Run a test coverage report.

    :param path: Test coverage path
    :return: Subprocess call result
    """
    cmd = f"py.test --cov-report term-missing --cov {path}"
    return subprocess.call(cmd, shell=True)


@cli.command()
def routes():
    """
    List all of the available routes.

    :return: str
    """
    output = {}

    for rule in app.url_map.iter_rules():
        route = {
            'path': rule.rule,
            'methods': '({0})'.format(', '.join(rule.methods))
        }

        output[rule.endpoint] = route

    endpoint_padding = max(len(endpoint) for endpoint in output.keys()) + 2

    for key in sorted(output):
        click.echo('{0: >{1}}: {2}'.format(key, endpoint_padding, output[key]))


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

    set_model_perms(User)
    set_model_perms(Profile, ['edit', 'view'])
    set_model_perms(Group)
    set_model_perms(grp_members, is_table=True)
    set_model_perms(grp_perms, is_table=True)
    set_model_perms(user_perms, is_table=True)

    print("Database was successfully initialized...")
    return None


@click.argument("num_of_users", default=260)
@cli.command()
def seed_users(num_of_users):
    """
    Seed the database with users.
    :param num_of_users: Number of users to seed the
    database with, default is 50.
    """
    print('Collecting users...')
    try:
        data = requests.get(
            'https://randomuser.me/api/?'
            f'results={num_of_users}'
            '&inc=name,email,login,picture,dob,location,nat'
        ).json()

        perms = Permission.query.all()

        print('Saving to database...')
        for user in data.get('results'):
            u = User(password='password')
            u.username = user.get('login')['username']
            u.email = user.get('email')
            u.created_on = random_timestamp(
                datetime.datetime(2018, 7, 1), datetime.datetime(2019, 2, 28))

            u.profile = Profile()
            u.profile.name = user.get('name')['first'] + \
                ' ' + user.get('name')['last']
            u.profile.avatar = user.get('picture')['thumbnail']
            u.profile.dob = user.get('dob')['date']
            u.profile.bio = f"Hi, I am {user.get('name')['first']} \
                from {user.get('location')['city']} \
                    {user.get('location')['state']}, {user.get('nat')}. \
                        I am a {user.get('dob')['age']} yrs old, who likes \
                            to tell jokes."
            u.profile.created_on = random_timestamp(
                datetime.datetime(2019, 1, 1), datetime.datetime(2019, 6, 30))

            u.permissions.extend(random.sample(
                perms, k=random.randrange(len(perms))))
            u.save()

        print('Setting up followers/following...')
        users = User.query.all()

        for user in users:
            following = random.sample(users, k=random.randrange(len(users)))
            user.followed.extend(following)
            user.save()

        print(f'Users table seeded with {num_of_users} users...')
    except exc.IntegrityError as error:
        db.session.rollback()
        print(f'Error: {error}')


@click.argument("num_of_posts", default=400)
@cli.command()
def seed_posts(num_of_posts):
    """
    Seed the database with some posts.
    """
    users = User.query.all()
    posts1 = []
    posts2 = []
    post_objs = []

    print('Fetching posts...')

    for i in range(int(num_of_posts/10)):
        posts1.extend(requests.get(
            'https://official-joke-api.appspot.com/jokes/ten').json())

    for i in range(20):
        posts2.extend(requests.get(
            f'https://icanhazdadjoke.com/search?limit=30&page={i}',
            headers={'accept': 'application/json'}).json().get('results'))

    try:
        print('Saving posts to database...')
        for p in posts1:
            user = random.choice(users)

            post = Post()
            post.body = f"{p.get('setup')} - {p.get('punchline')}"
            post.user_id = user.id
            post.likes.extend(random.sample(users, k=random.randrange(36)))
            post.created_on = random_timestamp(
                datetime.datetime(2019, 1, 1), datetime.datetime(2019, 7, 30))
            # post.tags.extend(item.)
            post_objs.append(post)

        for item in posts2:
            user = random.choice(users)

            post = Post()
            post.body = item.get('joke')
            post.user_id = user.id
            post.created_on = random_timestamp(
                datetime.datetime(2019, 7, 1), datetime.datetime(2020, 1, 31))
            post.likes.extend(random.sample(users, k=random.randrange(30)))
            post_objs.append(post)

        db.session.add_all(post_objs)
        db.session.commit()

        print(f'Post table seeded with {num_of_posts} posts...')
    except Exception as error:
        print(f'Error: {error}')


@click.argument("num_of_comments", default=2500)
@cli.command()
def seed_comments(num_of_comments):
    users = User.query.all()
    posts = Post.query.all()
    comments_list = []
    comment_objs = []

    try:
        print('Fetching comments...')
        for i in range(int(num_of_comments/500)):
            comments_list.extend(requests.get(
                'https://jsonplaceholder.typicode.com/comments').json())

        comments = [comment.get('body') for comment in comments_list]

        for c in comments[2001:]:
            user = random.choice(users)

            comment = Comment(body=c)
            comment.user_id = user.id
            comment.likes.extend(random.sample(users, k=random.randrange(3)))
            comment.created_on = random_timestamp(
                datetime.datetime(2020, 4, 1), datetime.datetime(2020, 7, 30))
            comment_objs.append(comment)

        db.session.add_all(comment_objs)

        comments_list = []

        print('Saving to database...')
        for c in comments[:2000]:
            user = random.choice(users)
            post = random.choice(posts)
            comment = random.choice(comment_objs)

            comment = Comment(body=c)
            comment.user_id = user.id
            comment.post_id = post.id
            comment.comment_id = comment.id
            comment.created_on = random_timestamp(
                datetime.datetime(2020, 3, 1), datetime.datetime(2020, 7, 31))
            comment.likes.extend(random.sample(users, k=random.randrange(6)))
            comments_list.append(comment)

        db.session.add_all(comments_list)
        db.session.commit()

    except Exception as error:
        print(f'Error: {error}')


@cli.command()
def seed_groups():
    """
    Seed the database with a few groups.
    """
    try:
        groups = [
            'partner',
            'junior partner',
            'senior associate',
            'associate',
            'paralegal'
        ]
        users = User.query.limit(24).all()
        perms = Permission.query.all()

        for group in groups:
            grp = Group(name=group)
            grp.members.extend(random.sample(
                users, k=random.randrange(len(users))))
            grp.permissions.extend(random.sample(
                perms, k=random.randrange(len(perms))))
            grp.save()

        print(f'Added users to {len(groups)} groups...')
    except Exception as error:
        print(f'Error: {error}')


if __name__ == '__main__':
    cli()
