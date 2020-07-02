import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    firstname = fields.Str(
        validate=validate.Length(min=2, max=32),
        required=True,
        error_messages={"required": "Firstname is required."}
    )
    lastname = fields.Str(
        validate=validate.Length(min=2, max=32),
        required=True,
        error_messages={"required": "Lastname is required."}
    )
    username = fields.Str(validate=validate.Length(min=3, max=32))
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required."}
    )
    password = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=6),
        error_messages={"required": "Password is required."}
    )
    avatar = fields.Url(validate=validate.Length(max=255))
    is_active = fields.Boolean()
    is_admin = fields.Boolean()
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)
    sign_in_count = fields.Int(dump_only=True)
    current_sign_in_on = fields.DateTime(dump_only=True)
    last_sign_in_on = fields.DateTime(dump_only=True)
    current_sign_in_ip = fields.Str(
        dump_only=True,
        validate=validate.Length(max=32),
    )
    last_sign_in_ip = fields.Str(
        dump_only=True,
        validate=validate.Length(max=32),
    )


@validates('username')
def validate_username(self, username):
    if re.match('^[a-zA-Z0-9_]+$', username) is None:
        raise ValidationError(
            'Username can only contain valid characters.'
        )


# class AuthSchema(Schema):
#     email = fields.Email(
#         required=True,
#         error_messages={"required": "Email is required."}
#     )
#     password = fields.Str(
#         required=True,
#         load_only=True,
#         validate=validate.Length(min=6),
#         error_messages={"required": "Password is required."}
#     )
#     firstname = fields.Str(
#         validate=validate.Length(min=2, max=32),
#         required=True,
#         error_messages={"required": "Firstname is required."}
#     )
#     lastname = fields.Str(
#         validate=validate.Length(min=2, max=32),
#         required=True,
#         error_messages={"required": "Lastname is required."}
#     )
