#!/usr/bin/env bash
# Render build command (Root Directory = backend)
set -o errexit

pip install --upgrade pip
pip install -r requirements/base.txt
python manage.py collectstatic --noinput
