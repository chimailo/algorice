from src.blueprints.profiles.models import Profile
from src.blueprints.auth.models import User


def add_user(
        firstname='',
        lastname='',
        username='',
        email='',
        avatar='',
        bio='',
        is_admin=False,
        is_active=True):

    user = User(password='password')
    user.firstname = firstname
    user.lastname = lastname
    user.username = username or user.set_username()
    user.email = email
    user.avatar = user.set_avatar(email)
    user.is_admin = is_admin
    user.is_active = is_active

    profile = Profile(bio=bio)
    user.profile = profile
    user.save()
    return user
