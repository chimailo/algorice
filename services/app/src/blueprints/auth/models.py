from datetime import datetime, timedelta
import jwt

from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash

from src import db
from src.utils.models import ResourceMixin
from src.blueprints.admin.models import Permission


user_perms = db.Table(
    'user_permissions',
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'perm_id',
        db.Integer,
        db.ForeignKey(
            'permissions.id',
            ondelete='CASCADE',
            onupdate='CASCADE'
        ),
        primary_key=True
    )
)


followers = db.Table(
    'followers',
    db.Column(
        'follower_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'followed_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True)
)


class User(db.Model, ResourceMixin):
    __tablename__ = 'users'

    # Identification
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(
        db.String(128),
        index=True,
        unique=True,
        nullable=False
    )
    email = db.Column(
        db.String(128),
        index=True,
        unique=True,
        nullable=False
    )
    password = db.Column(db.String(128), nullable=False)

    # Authorization
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False, nullable=False)

    # Activity tracking.
    sign_in_count = db.Column(db.Integer, nullable=False, default=0)
    current_sign_in_on = db.Column(db.DateTime)
    current_sign_in_ip = db.Column(db.String(32))
    last_sign_in_on = db.Column(db.DateTime)
    last_sign_in_ip = db.Column(db.String(32))

    # Relationships
    permissions = db.relationship(
        'Permission',
        secondary=user_perms,
        backref=db.backref('users', lazy='dynamic'),
        lazy='dynamic'
    )
    profile = db.relationship(
        'Profile', uselist=False, backref='user',
        lazy='joined', cascade='all, delete-orphan')
    followed = db.relationship(
        'User', secondary='followers', lazy='dynamic',
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic')
    )
    posts = db.relationship('Post', backref='author')
    comments = db.relationship('Comment', backref='author')

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self.password = User.hash_password(kwargs.get('password', ''))

    def __str__(self):
        return f'<User {self.username}>'

    @classmethod
    def find_by_identity(cls, identity):
        """
        Find a user by their identity.

        :param: user identity - email or username
        :return: User instance
        """
        return cls.query.filter(
            (cls.email == identity) | (cls.username == identity)
        ).first()

    @classmethod
    def hash_password(cls, password):
        """
        Hash a plaintext string using PBKDF2.

        :param password: Password in plain text
        :type password: str
        :return: str
        """
        if password:
            return generate_password_hash(password)

        return None

    def check_password(self, password):
        """
        Check if the provided password matches that of the specified user.

        :param password: Password in plain text
        :return: boolean
        """
        return check_password_hash(self.password, password)

    def encode_auth_token(self, id):
        """Generates the auth token"""
        try:
            payload = {
                'exp': datetime.utcnow() + timedelta(
                    days=current_app.config.get('TOKEN_EXPIRATION_DAYS'),
                    seconds=current_app.config.get('TOKEN_EXPIRATION_SECONDS')
                ),
                'iat': datetime.utcnow(),
                'sub': {
                    'id': id,
                }
            }
            return jwt.encode(
                payload,
                current_app.config.get('SECRET_KEY'),
                algorithm='HS256'
            )
        except Exception as e:
            return e

    @staticmethod
    def decode_auth_token(token):
        """
        Decodes the auth token

        :param string: token
        :return dict: The user's identity
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config.get('SECRET_KEY'),
                algorithms='HS256'
            )
            return payload.get('sub')
        except jwt.ExpiredSignatureError:
            return 'Signature expired. Please log in again.'
        except jwt.InvalidTokenError:
            return 'Invalid token. Please log in again.'

    def update_activity_tracking(self, ip_address):
        """
        Update various fields on the user that's
        related to meta data on their account.

        :param ip_address: str
        :return: SQLAlchemy commit results
        """
        self.sign_in_count += 1

        self.last_sign_in_on = self.current_sign_in_on
        self.last_sign_in_ip = self.current_sign_in_ip

        self.current_sign_in_on = datetime.utcnow()
        self.current_sign_in_ip = ip_address

        return self.save()

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0

    def user_has_perm(self, perm):
        return self.permissions.filter(
            user_perms.c.perm_id == perm.id).count() > 0

    def add_permissions(self, perms):
        for perm in perms:
            if not self.user_has_perm(perm):
                self.permissions.append(perm)
                self.save()

    def remove_permissions(self, perms):
        for perm in perms:
            if self.user_has_perm(perm):
                self.permissions.remove(perm)
                self.save()

    def get_perms(self):
        perms = []

        for perm in self.permissions:
            perms.append(perm)

        return perms

    def get_all_perms(self):
        perms = []

        for group in self.groups:
            for perm in group.permissions:
                perms.append(perm)

        return list(set(perms).union(set(self.get_perms())))

    def has_permission(self, name):
        perm = Permission.find_by_name(name)
        return perm in self.get_all_perms()

    def has_permissions(self, perms_list):
        perms = []

        for perm in perms_list:
            p = Permission.find_by_name(perm)
            perms.append(p)

        return set(perms).issubset(set(self.get_all_perms()))
