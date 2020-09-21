from src import db
from src.utils.models import ResourceMixin


post_likes = db.Table(
    'post_likes',
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'post_id',
        db.Integer,
        db.ForeignKey('posts.id', ondelete='CASCADE',  onupdate='CASCADE'),
        primary_key=True
    )
)


comment_likes = db.Table(
    'comment_likes',
    db.Column(
        'user_id',
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'),
        primary_key=True
    ),
    db.Column(
        'comment_id',
        db.Integer,
        db.ForeignKey('comments.id', ondelete='CASCADE',  onupdate='CASCADE'),
        primary_key=True
    )
)


class Post(db.Model, ResourceMixin):
    __tablename__ = 'posts'

    # Identification
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'))
    # relationships
    comments = db.relationship('Comment', backref='post')
    tags = db.relationship('Tag', backref='post')
    likes = db.relationship(
        'User', secondary=post_likes, lazy='dynamic', backref=db.backref(
            'likes', lazy='dynamic'))

    def __repr__(self):
        return f'<Post {self.body}>'

    def is_liked_by(self, user):
        return self.likes.filter(
            post_likes.c.user_id == user.id).count() > 0


class Comment(db.Model, ResourceMixin):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'))
    post_id = db.Column(
        db.Integer,
        db.ForeignKey('posts.id', ondelete='CASCADE', onupdate='CASCADE'))
    comment_id = db.Column(db.Integer, db.ForeignKey(
        'comments.id', ondelete='SET NULL'))
    replies = db.relationship('Comment', lazy='joined')
    likes = db.relationship(
        'User', secondary=comment_likes, lazy='dynamic', backref=db.backref(
            'comment_likes', lazy='dynamic'))

    def __repr__(self):
        return f'<Post {self.body}>'

    def is_liked_by(self, user):
        return self.likes.filter(
            comment_likes.c.user_id == user.id).count() > 0


class Tag(db.Model, ResourceMixin):
    name = db.Column(db.String(16), nullable=False, index=True, unique=True)
    slug = db.Column(
        db.String(16),
        nullable=False,
        index=True,
        unique=True,
        primary_key=True)
    post_id = db.Column(
        db.Integer,
        db.ForeignKey('posts.id', ondelete='CASCADE', onupdate='CASCADE'))
