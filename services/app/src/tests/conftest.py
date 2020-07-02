import pytest

from src import create_app, db as _db
from src.config import TestingConfig
from src.tests.utils import add_user
from src.blueprints.auth.models import User


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a new app instance for each test.

    :returns -- object: Flask app
    """
    # create the app with test config.
    app = create_app(config=TestingConfig)

    ctx = app.app_context()
    ctx.push()

    yield app

    ctx.pop()


@pytest.fixture(scope='function')
def client(app):
    """
    Setup an app client, this gets executed for each client.

    :arguments: app {object} -- Pytext fixture
    :return: Flask app client
    """
    return app.test_client()


@pytest.fixture(scope='session')
def db(app):
    """
    Setup the database, this gets executed for every function

    :param app: Pytest fixture
    :return: SQLAlchemy database session
    """
    _db.drop_all()
    _db.create_all()

    admin = add_user(
        firstname='admin',
        lastname='user',
        email='adminuser@test.com')

    _db.session.add(admin)
    _db.session.commit()

    return _db


@pytest.yield_fixture(scope='function')
def session(db):
    """
    Allow very fast tests by using rollbacks and nested sessions.
    :param db: Pytest fixture
    :return: None
    """
    db.session.begin_nested()
    yield db.session
    db.session.rollback()

    return db


@pytest.fixture(scope='function')
def users(db):
    """
    Create user fixtures. They reset per test.

    :param db: Pytest fixture
    :return: SQLAlchemy database session
    """
    db.session.query(User).delete()

    admin = add_user(
        firstname='admin',
        lastname='user',
        email='adminuser@test.com',
        is_admin=True
    )

    regular = add_user(
        firstname='regular',
        lastname='user',
        email='regularuser@test.com'
    )

    db.session.add(admin)
    db.session.add(regular)
    db.session.commit()

    return db


@pytest.fixture(scope='function')
def token(users):
    """
    Serialize a JWT token.

    :param db: Pytest fixture
    :return: JWT token
    """
    user = User.find_by_identity('adminuser@test.com')
    print(user.id)
    return user.encode_auth_token(user.id).decode()
