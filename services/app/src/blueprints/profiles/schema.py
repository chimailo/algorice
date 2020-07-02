from marshmallow import Schema, fields, validate


class ProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    bio = fields.Str(validate=validate.Length(max=255))
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)

    user = fields.Nested(
        'UserSchema',
        only=('firstname', 'lastname', 'username',),
        load_only=True,
        required=True
    )
