from flask import jsonify, request, Blueprint
from marshmallow import ValidationError

from src.utils.decorators import authenticate
from src.blueprints.errors import error_response, bad_request, server_error
from src.blueprints.auth.schema import UserSchema
from src.blueprints.profiles.schema import ProfileSchema


profile = Blueprint('profile', __name__, url_prefix='/api')


@profile.route('/profile', methods=['GET'])
@authenticate
def get_profile(user):
    return jsonify(ProfileSchema().dump(user.profile))


@profile.route('/profile', methods=['PUT'])
@authenticate
def update_profile(user):
    print(request.headers)
    request_data = request.get_json()
    # print("@"*15 + request_data + "@"*15)

    if not request_data:
        return bad_request("No input data provided")

    try:
        data = ProfileSchema().load(
            request_data,
            partial=('user.firstname', 'user.lastname', 'user.username', 'bio')
        )

        user.firstname = data.get('user')['firstname']
        user.lastname = data.get('user')['lastname']
        user.username = data.get('user')['username']
        profile = user.profile
        profile.bio = data.get('bio')
        user.save()

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
        return {'message': 'Successfully deleted profile.'}
    except Exception:
        return server_error('Something went wrong, please try again.')
