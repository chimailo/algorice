from sqlalchemy import exc
from flask import Blueprint, current_app, jsonify

from src import db
from src.utils.decorators import authenticate
from src.blueprints.errors import server_error, not_found
from src.blueprints.auth.models import User
from src.blueprints.posts.models import Post, Comment
from src.blueprints.users.schema import UserSchema
from src.blueprints.posts.schema import PostSchema, CommentSchema


users = Blueprint('users', __name__, url_prefix='/api/users')


@users.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Users Route!'}


@users.route('/follow/<int:id>', methods=['POST'])
@authenticate
def follow(user, id):
    to_follow = User.find_by_id(id)

    if not to_follow:
        return not_found('User not found')

    user.follow(to_follow)

    try:
        user.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(UserSchema(
            many=True, only=('id',)).dump(user.followed.all()))


@users.route('/unfollow/<int:id>', methods=['POST'])
@authenticate
def unfollow(user, id):
    followed = User.find_by_id(id)

    if not followed:
        return not_found('User not found')

    user.unfollow(followed)

    try:
        user.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(UserSchema(
            many=True, only=('id',)).dump(user.followed.all()))


@users.route('/following', methods=['GET'])
@authenticate
def get_all_following(user):
    return jsonify(UserSchema(many=True, only=('id',)).dump(user.followed))


@users.route('/followers', methods=['GET'])
@authenticate
def get_all_followers(user):
    return jsonify(UserSchema(many=True, only=('id',)).dump(user.followers))


@users.route('/likes', methods=['GET'])
@authenticate
def get_all_likes(user):
    return jsonify(PostSchema(many=True, only=('id',)).dump(user.likes))


@users.route('/<username>/followers/page/<int:page>', methods=['GET'])
@authenticate
def get_followers(user, username, page=1):
    """Get list of users following a user"""
    user = User.find_by_identity(username)
    try:
        followers = user.followers.paginate(
            page, current_app.config['ITEMS_PER_PAGE'], False)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'followers': UserSchema(many=True, only=(
                'id', 'username', 'profile',)).dump(followers.items),
            'count': user.followers.count(),
            'hasNext': followers.has_next,
        }


@users.route('/<username>/following/page/<int:page>', methods=['GET'])
@authenticate
def get_following(user, username, page=1):
    """Get list of users following a user"""
    user = User.find_by_identity(username)
    try:
        following = user.followed.paginate(
            page, current_app.config['ITEMS_PER_PAGE'], False)
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'following': UserSchema(many=True, only=(
                'id', 'username', 'profile',)).dump(following.items),
            'hasNext': following.has_next,
            'count': user.followed.count(),
        }


@users.route('/<username>/posts/page/<int:page>', methods=['GET'])
@authenticate
def get_user_posts(user, username, page=1):
    """Get a users list of posts"""
    user = User.find_by_identity(username)
    try:
        posts = Post.query.with_parent(user).order_by(
            Post.created_on.desc()).paginate(
                page, current_app.config['ITEMS_PER_PAGE'])
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'posts': PostSchema(many=True).dump(posts.items),
            'hasNext': posts.has_next,
        }


@users.route('/<username>/comments/page/<int:page>', methods=['GET'])
@authenticate
def get_user_comments(user, username, page=1):
    """Get a users list of comments"""
    user = User.find_by_identity(username)
    try:
        comments = Comment.query.with_parent(user).order_by(
            Comment.created_on.desc()).paginate(
                page, current_app.config['ITEMS_PER_PAGE'])
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'comments': CommentSchema(many=True).dump(comments.items),
            'hasNext': comments.has_next,
        }


@users.route('/<username>/likes/page/<int:page>', methods=['GET'])
@authenticate
def get_liked_posts(user, username, page=1):
    """Get a users list of liked posts"""
    user = User.find_by_identity(username)
    try:
        liked_posts = user.likes.order_by(Post.created_on.desc()).paginate(
            page, current_app.config['ITEMS_PER_PAGE'])
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return {
            'likes': PostSchema(many=True).dump(liked_posts.items),
            'hasNext': liked_posts.has_next,
        }
