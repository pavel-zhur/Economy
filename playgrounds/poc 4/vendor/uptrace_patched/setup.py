import os

import setuptools

PKG_INFO = {}
with open(os.path.join("src", "uptrace", "version.py")) as f:
    exec(f.read(), PKG_INFO)

setuptools.setup(version="1.31.0.post1")