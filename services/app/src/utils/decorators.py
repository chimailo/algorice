from functools import wraps

from flask import request

from src.blueprints.errors import error_response
from src.blueprints.auth.models import User


def get_user():
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return error_response(403, message='No authorization.')

    token = auth_header.split(" ")[1]
    payload = User.decode_auth_token(token)

    if not isinstance(payload, dict):
        return error_response(401, message=payload)

    return User.find_by_id(payload.get('id'))


def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = get_user()

        if user is None:
            return error_response(401, message='Invalid token.')

        return func(user, *args, **kwargs)
    return wrapper


# def permission_required(perm):
#     """
#     Does a user have permission to view this page?

#     :param perm: 
#     :return: Function
#     """
#     def decorator(func):
#         @wraps(func)
#         def wrapper(*args, **kwargs):
#             user = get_user()

#             if user is None or user.is_active is not True:
#                 return error_response(401, message='Invalid token.')

#             return func(user, *args, **kwargs)
#         return wrapper
#     return decorator