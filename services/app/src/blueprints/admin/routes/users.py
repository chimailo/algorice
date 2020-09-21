from sqlalchemy import exc
from flask import jsonify, request, url_for, current_app
from marshmallow import ValidationError

from src import db
from src.blueprints.errors import error_response, \
    bad_request, not_found, server_error
from src.blueprints.admin.routes import admin
from src.blueprints.auth.models import User
from src.blueprints.profiles.models import Profile
from src.blueprints.admin.models import Permission
from src.blueprints.auth.schema import AuthSchema
from src.blueprints.users.schema import UserSchema
from src.blueprints.profiles.schema import ProfileSchema


@admin.route('/users/page/<int:page>', methods=['GET'])
@admin.route('/users', methods=['GET'])
# @permission_required(['can_view_user'])
def get_users(page=1):
    """Get list of users"""
    users = User.query.paginate(
        page, current_app.config['ITEMS_PER_PAGE'], False)
    next_url = url_for('admin.get_users', page=users.next_num) \
        if users.has_next else None
    prev_url = url_for('admin.get_users', page=users.prev_num) \
        if users.has_prev else None

    return {
        'items': UserSchema(many=True).dump(users.items),
        'next_url': next_url,
        'prev_url': prev_url
    }


@admin.route('/users/<int:id>', methods=['GET'])
# @permission_required(['can_view_user'])
def get_user(id):
    """Get a single user"""
    user = User.find_by_id(id)
    if user is None:
        return not_found('User not found!')
    return jsonify(UserSchema().dump(user))


@admin.route('/users', methods=['POST'])
# @permission_required(['can_add_user'])
def add_user():
    request_data = request.get_json()

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = AuthSchema().load(request_data)

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        username = data.get('username')

        # check for existing user
        user = User.query.filter((User.email == email) | (
            User.username == username)).first()

        if user is not None:
            return bad_request('That user already exists.')

        # add new user to db
        profile = Profile(name=name)
        user = User(password=password)
        user.email = email
        user.username = username
        user.is_active = data.get('is_active') or False
        user.is_admin = data.get('is_admin') or False
        user.profile = profile
        user.save()

        response = jsonify(UserSchema().dump(user))
        response.status_code = 201
        response.headers['Location'] = url_for(
            'admin.get_user', id=user.id)
        return response

    # handle errors
    except ValidationError as err:
        return error_response(422, err.messages)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')


@admin.route('/users/<int:id>', methods=['PUT'])
# @permission_required(['can_update_user'])
def update_user(id):
    request_data = request.get_json()

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = ProfileSchema().load(request_data)

        user = User.find_by_id(id)
        existing_user = User.find_by_identity(data.get('auth')['username'])

        if existing_user is not None:
            if existing_user.id != user.id:
                return bad_request(f'Username already exists.')

        # update user
        user.profile.name = data.get('name')
        user.profile.bio = data.get('bio')
        user.profile.dob = data.get('dob')
        user.username = data.get('auth')['username']
        user.is_active = data.get('auth')['is_active']
        user.is_admin = data.get('auth')['is_admin']
        user.save()

        return jsonify(UserSchema().dump(user))

    # handle errors
    except ValidationError as err:
        return error_response(422, err.messages)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')


@admin.route('/users/<int:id>', methods=['DELETE'])
# @permission_required(['can_delete_user'])
def delete_user(id):
    try:
        user = User.find_by_id(id)

        if user is None:
            return not_found('User does not exist.')

        user.delete()
        return jsonify({'message': 'Successfully deleted user.'})
    except Exception as error:
        return jsonify({'message': error})


@admin.route('/users/<int:id>/permissions', methods=['PUT'])
# @permission_required(['can_delete_user'])
def add_user_permissions(id):
    data = request.get_json()
    user = User.find_by_id(id)

    perms = []
    for id in data.get('perms'):
        perm = Permission.find_by_id(id)
        perms.append(perm)

    user.add_permissions(perms)
    return jsonify(UserSchema().dump(user))


@admin.route('/users/<int:id>/permissions', methods=['DELETE'])
# @permission_required(['can_delete_user'])
def remove_user_permissions(id):
    data = request.get_json()
    user = User.find_by_id(id)

    perms = []
    for id in data.get('perms'):
        perm = Permission.find_by_id(id)
        perms.append(perm)

    user.remove_permissions(perms)
    return jsonify(UserSchema().dump(user))
