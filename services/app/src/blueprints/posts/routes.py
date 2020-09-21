from sqlalchemy import exc
from flask import url_for, request, jsonify, Blueprint, current_app

from src import db
from src.utils.decorators import authenticate
from src.blueprints.errors import server_error, not_found, error_response
from src.blueprints.posts.models import Post, Comment
from src.blueprints.posts.schema import PostSchema, CommentSchema


posts = Blueprint('posts', __name__, url_prefix='/api/posts')


@posts.route('/ping', methods=['GET'])
def ping():
    return {'message': 'Post Route!'}


@posts.route('/<int:post_id>', methods=['GET'])
@authenticate
def get_post(user, post_id):
    try:
        print(post_id)
        post = Post.find_by_id(post_id)

        if not post:
            return not_found('Post not found')
    except Exception:
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(PostSchema().dump(post))


@posts.route('/<feed>/page/<int:page>', methods=['GET'])
@authenticate
def get_post_feed(user, feed, page=1):
    pass


@posts.route('', methods=['POST'])
@authenticate
def create_post(user):
    post_data = request.get_json()
    print(post_data)

    post = Post()
    post.body = post_data.get('post')
    post.user_id = user.id

    try:
        post.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        response = jsonify(PostSchema().dump(post))
        response.status_code = 201
        response.headers['Location'] = url_for(
            'posts.get_post', post_id=post.id)
        return response


@posts.route('/<int:post_id>', methods=['PUT'])
@authenticate
def update_post(user, post_id):
    post_data = request.get_json()
    post = Post.find_by_id(post_id)

    if not post:
        return not_found('Post not found.')

    if post.user_id != user.id:
        return error_response(401, "You cannot update someone else's post.")

    post.body = post_data.get('post')

    try:
        post.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(PostSchema().dump(post))


@posts.route('/<int:post_id>', methods=['DELETE'])
@authenticate
def delete_post(user, post_id):
    post = Post.find_by_id(post_id)

    if not post:
        return not_found('Post not found.')

    if post.user_id != user.id:
        return error_response(401, "You cannot delete someone else's post.")

    try:
        post.delete()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(PostSchema().dump(post.id))


@posts.route('/<int:post_id>/likes', methods=['POST'])
@authenticate
def update_like(user, post_id):
    post = Post.find_by_id(post_id)

    if not post:
        return not_found('Post not found')

    try:
        if post.is_liked_by(user):
            post.likes.remove(user)
        else:
            post.likes.append(user)

        post.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(PostSchema().dump(post))


@posts.route('/<int:post_id>/comments/page/<int:page>', methods=['GET'])
@authenticate
def get_comments(user, post_id, page=1):
    post = Post.find_by_id(post_id)

    if not post:
        return not_found('Post not found.')

    try:
        comments = Comment.query.with_parent(post).order_by(
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


@posts.route('/<int:post_id>/comments', methods=['POST'])
@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['POST'])
@authenticate
def create_comment(user, post_id, comment_id=None):
    data = request.get_json()

    comment = Comment()
    comment.body = data.get('comment')
    comment.user_id = user.id
    comment.post_id = post_id

    if comment_id:
        comment.comment_id = comment_id

    try:
        comment.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        response = jsonify(CommentSchema().dump(comment))
        response.status_code = 201
        return response


@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
@authenticate
def update_comment(user, post_id, comment_id):
    data = request.get_json()
    comment = Comment.find_by_id(comment_id)

    if not comment:
        return not_found('Comment not found.')

    if comment.user_id != user.id:
        return error_response(401, 'Not authorized for that action.')

    comment.body = data.get('post')

    try:
        comment.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(CommentSchema().dump(comment))


@posts.route('/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
@authenticate
def delete_comment(user, post_id, comment_id):
    comment = Comment.find_by_id(comment_id)

    if not comment:
        return not_found('Comment not found.')

    if comment.user_id != user.id:
        return error_response(401, 'Not authorized for that action.')

    try:
        comment.delete()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(CommentSchema().dump(comment.id))


@posts.route('/<int:post_id>/comments/<int:comment_id>/likes', methods=['POST'])
@authenticate
def update_comment_like(user, post_id, comment_id):
    comment = Comment.find_by_id(comment_id)

    if not comment:
        return not_found('Comment not found')

    if comment.is_liked_by(user):
        comment.likes.remove(user)
    else:
        comment.likes.append(user)

    try:
        comment.save()
    except (exc.IntegrityError, ValueError):
        db.session.rollback()
        return server_error('Something went wrong, please try again.')
    else:
        return jsonify(CommentSchema().dump(comment))
