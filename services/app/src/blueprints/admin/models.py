from src import db
from src.utils.models import ResourceMixin


grp_members = db.Table(
    'group_members',
    db.Column(
        'group_id',
        db.Integer,
        db.ForeignKey('group.id', ondelete='SET NULL', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL', onupdate='CASCADE'),
        primary_key=True
    )
)


class Group(db.Model, ResourceMixin):
    __tablename__ = 'groups'

    # Identification
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), unique=True, index=True, nullable=False)
    description = db.Column(db.String(250))

    # relationships
    members = db.relationship(
        'User',
        secondary=grp_members,
        backref='groups'
    )

    def __str__(self):
        return f'<Group: {self.name}>'