from marshmallow import Schema, fields, validate


class ProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(
        validate=validate.Length(min=2, max=128),
        required=True,
        error_messages={"required": "Name is required."}
    )
    avatar = fields.Url(validate=validate.Length(max=255), dump_only=True)
    bio = fields.Str(validate=validate.Length(max=255))
    dob = fields.DateTime()
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)

    auth = fields.Nested(
        'UserSchema', only=(
            'username', 'is_active', 'is_admin',), load_only=True)
