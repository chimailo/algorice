import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class AuthSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(
        validate=validate.Length(min=2, max=128),
        load_only=True,
        required=True,
        error_messages={"required": "Name is required."}
    )
    username = fields.Str(
        validate=validate.Length(min=3, max=32),
        required=True,
        error_messages={"required": "Name is required."}
    )
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


@validates('username')
def validate_username(self, username):
    if re.match('^[a-zA-Z0-9_]+$', username) is None:
        raise ValidationError(
            'Username can only contain valid characters.'
        )
