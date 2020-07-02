# from flask import current_app
from src.blueprints.auth.models import User


# auth
#############
def test_password_hashing(db):
    user = User.find_by_identity('adminuser@test.com')
    assert user.check_password('secret') is False
    assert user.check_password('password') is True


def test_avatar(users):
    user = User.find_by_identity('regularuser@test.com')
    assert user.avatar, ('https://www.gravatar.com/avatar/'
                        'e6b6b9ec69c4837878505768b621d383?s=128&d=mm&r=pg')


def test_encode_token(token):
    """ Token serializer encodes a JWT correctly. """
    assert token.count('.') == 2


def test_decode_token(token):
    """ Token decoder decodes a JWT correctly. """
    payload = User.decode_auth_token(token)
    user = User.find_by_id(payload.get('id'))
    assert isinstance(user, User) is True
    assert user.email == 'adminuser@test.com'


def test_decode_token_invalid(token):
    """ Token decoder returns 'Invalid token' when
    it's been tampered with."""
    payload = User.decode_auth_token(f'{token}1337')
    assert isinstance(payload, User) is False
    assert 'Invalid token' in payload


# def test_decode_token_expired(users):
#     """ Token decoder returns None when it's been tampered with. """
#     current_app.config['TOKEN_EXPIRATION_SECONDS'] = -1
#     user = User.find_by_identity('regularuser@test.com')
#     token = user.encode_auth_token(user.id)
#     payload = User.decode_auth_token(token)
#     assert isinstance(payload, User) is False
#     assert 'Signature expired', payload
