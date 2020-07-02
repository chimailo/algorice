from src import db
from src.utils.models import ResourceMixin


class Profile(db.Model, ResourceMixin):
    __tablename__ = 'profiles'

    # Identification
    id = db.Column(db.Integer, primary_key=True)
    bio = db.Column(db.String(255))
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        nullable=False
    )

    def __repr__(self):
        return f'<Profile: {self.id} {self.firstname} {self.lastname}>'
