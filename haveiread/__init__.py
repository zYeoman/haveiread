#! /usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright © 2019 Yongwen Zhuang <zeoman@163.com>
#
# Distributed under terms of the MIT license.

"""
Init track server
"""

import os

from flask import Flask
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'readlist.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    from . import api
    api.init_app(app)

    @app.route('/')
    def hello_world():
        return "hello world"

    CORS(app)

    return app
