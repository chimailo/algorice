from sqlalchemy import exc
from marshmallow import ValidationError
from flask import jsonify, request, url_for, Blueprint

from src import db
from src.utils.decorators import authenticate
from src.blueprints.errors import error_response, bad_request, server_error
from src.blueprints.auth.models import User
from src.blueprints.profiles.models import Profile
from src.blueprints.auth.schema import UserSchema


auth = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Auth Route!'}


@auth.route('/check-username', methods=['POST'])
def check_username():
    data = request.get_json()
    user = User.find_by_identity(data.get('username'))

    if user is not None:
        if user.id != id:
            return {'res': False}

    return {'res': True}


@auth.route('/check-email', methods=['POST'])
def check_email():
    data = request.get_json()
    user = User.find_by_identity(data.get('email'))
    return {'res': not isinstance(user, User)}


@auth.route('/register', methods=['POST'])
def register_user():
    request_data = request.get_json()

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = UserSchema(partial=True).load(request_data)

        email = data.get('email')
        password = data.get('password')
        firstname = data.get('firstname').title()
        lastname = data.get('lastname').title()

        # check for existing user
        user = User.query.filter(User.email == email).first()

        if user:
            return bad_request('That user already exists.')

        user = User()
        user.email = email
        user.firstname = firstname.capitalize()
        user.lastname = lastname.capitalize()
        user.password = password
        user.username = user.set_username()
        user.avatar = user.set_avatar(email)
        user.save()

        response = jsonify({
            'token': user.encode_auth_token(user.id).decode(),
        })
        response.status_code = 201
        response.headers['Location'] = url_for(
            'auth.get_user', id=user.id
        )
        return response

    # handle errors
    except ValidationError as err:
        return error_response(422, err.messages)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')


@auth.route('/login', methods=['POST'])
def login_user():
    request_data = request.get_json()

    if request_data is None:
        return bad_request("No input data provided")

    try:
        data = UserSchema(partial=True).load(request_data)

        # check for existing user
        user = User.find_by_identity(data.get('email'))

        if user and user.check_password(data.get('password')):
            user.update_activity_tracking(request.remote_addr)

            return jsonify({
                'token': user.encode_auth_token(user.id).decode(),
            })
        else:
            return error_response(401, 'Incorrect email or password.')

    except Exception:
        return bad_request('Invalid payload, please try again.')


@auth.route('/logout', methods=['GET'])
@authenticate
def logout_user(user):
    return jsonify({'message': 'Successfully logged out.'})


@auth.route('/user', methods=['GET'])
@authenticate
def get_user(user):
    return jsonify(UserSchema(
                only=(
                    'id', 'email', 'username', 'firstname', 'avatar',
                    'lastname', 'is_active', 'is_admin'
                )
            ).dump(user))


@auth.route('/reset-password', methods=['GET'])
@authenticate
def reset_password():
    pass
