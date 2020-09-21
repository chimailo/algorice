from flask import jsonify, request, Blueprint
from marshmallow import ValidationError

from src.utils.decorators import authenticate
from src.blueprints.errors import error_response, \
    bad_request, server_error, not_found
from src.blueprints.profiles.schema import ProfileSchema
from src.blueprints.auth.models import User
from src.blueprints.users.schema import UserSchema

profile = Blueprint('profile', __name__, url_prefix='/api')


@profile.route('/profile/<username>', methods=['GET'])
@authenticate
def get_profile(user, username):
    user = User.find_by_identity(username)

    if user:
        return jsonify(UserSchema().dump(user))

    return not_found('User not found.')


@profile.route('/profile', methods=['PUT'])
@authenticate
def update_profile(user):
    request_data = request.get_json()

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = ProfileSchema().load(request_data)

        profile = user.profile
        profile.name = data.get('name')
        profile.dob = data.get('dob')
        profile.bio = data.get('bio')
        profile.save()

        return jsonify(ProfileSchema().dump(profile))

    except ValidationError as error:
        return error_response(422, error.messages)
    except Exception:
        return server_error('Something went wrong, please try again.')


@profile.route('/profile', methods=['DELETE'])
@authenticate
def delete_profile(user):
    try:
        user.delete()
        return {'message': 'Successfully deleted.'}
    except Exception:
        return server_error('Something went wrong, please try again.')
