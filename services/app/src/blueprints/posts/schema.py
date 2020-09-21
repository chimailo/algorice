import re
from marshmallow import Schema, fields, validate, validates, ValidationError


class PostSchema(Schema):
    id = fields.Int(dump_only=True)
    body = fields.Str(required=True)
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)
    author = fields.Nested('UserSchema', dump_only=True, only=(
        'id', 'username', 'profile',))
    likes = fields.List(fields.Nested(
        lambda: PostSchema(only=('id',)), dump_only=True))
    comments = fields.List(fields.Nested(
        lambda: CommentSchema(only=('id',)), dump_only=True))


class CommentSchema(Schema):
    id = fields.Int(dump_only=True)
    body = fields.Str(required=True)
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)
    author = fields.Nested(
        'UserSchema', dump_only=True, only=('id', 'username', 'profile',))
    replies = fields.List(
        fields.Nested(lambda: CommentSchema(), dump_only=True))
    likes = fields.List(fields.Nested(
        lambda: CommentSchema(only=('id',)), dump_only=True))


class TagSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(validate=validate.Length(min=2, max=16), required=True)
    created_on = fields.DateTime(dump_only=True)
    updated_on = fields.DateTime(dump_only=True)


@validates('name')
def validate_tag_name(self, name):
    if re.match('^[a-zA-Z0-9_]+$', name) is None:
        raise ValidationError(
            'Tag name can only contain valid characters.'
        )
