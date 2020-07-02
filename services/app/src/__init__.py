import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS


# set up extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()


app_settings = os.getenv('APP_SETTINGS')


def create_app(config=app_settings):
    """
    Create a Flask application using the app factory pattern.

    :return - object: Flask app
    """
    # Instantiate app
    app = Flask(__name__)

    # Set configuration
    app.config.from_object(config)

    # set up extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    @app.route('/api/ping')
    def ping():
        return {"message": "Ping!"}

    # Register Blueprint
    from src.blueprints.errors import errors
    app.register_blueprint(errors)

    from src.blueprints.admin.routes import admin
    app.register_blueprint(admin)

    from src.blueprints.auth.routes import auth
    app.register_blueprint(auth)

    from src.blueprints.profiles.routes import profile
    app.register_blueprint(profile)

    # from src.blueprints.exercises.routes import exercises
    # app.register_blueprint(exercises)

    # from src.blueprints.submissions.routes import submissions
    # app.register_blueprint(submissions)

    @app.shell_context_processor
    def ctx():
        """shell context for flask cli """
        return {"app": app, "db": db}

    return app


from src.blueprints.auth.models import User
from src.blueprints.profiles.models import Profile
from src.blueprints.admin.models import Group
# from src.blueprints.exercises.models import Exercise
# from src.blueprints.submissions.models import Submission
