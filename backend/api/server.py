import sys
import re
import os
import urllib.request
import datetime
from json import dumps
from flask import Flask, request
from flask_cors import CORS
from flask_restx import Api
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from utils import place
from config.exception import ValueError, AccessError, default_handler
from service.user_management import user
from service.group_plan import group, schedule, group_activities
from service.activity_help import activity_help

''' Backend Flask Server '''

app = Flask(__name__)
app.config['TRAP_HTTP_EXCEPTIONS'] = True
app.register_error_handler(Exception, default_handler)
CORS(app)
api = Api(app)

@app.route('/login', methods=['POST'])
def login():
    ''' user login '''
    body = request.get_json()
    access_token = body['token']
    user_email = body['email']
    user.login(user_email, access_token)
    return dumps({})

@app.route('/group', methods=['POST'])
def create_group():
    ''' create a new group '''
    body = request.get_json()
    leader_token = body['token']
    group_name = body['group_name']
    trip_date = body['trip_date']
    location = body['location']
    if not (re.match('^[a-zA-Z0-9\-\ ]*$', group_name)):
        raise ValueError('Invalid group name. \
            Group name may contain alphanumeric characters, spaces and hyphens only.')
    try:
        date_format_check = datetime.datetime.strptime(trip_date, '%Y-%m-%d')
    except Exception:
        raise ValueError('Trip date must be in ISO format')
    group.create_group(group_name, leader_token, trip_date, location)
    return dumps({})

@app.route('/location', methods=['GET'])
def get_group_location():
    ''' get group trip location '''
    group_id = request.values.get('group_id')
    return dumps(group.get_location(group_id))

@app.route('/activities/<group_id>', methods=['GET'])
def list_activities(group_id):
    ''' list all nominated activities of certain group '''
    nominations = group_activities.get_nominations(group_id)
    return dumps(nominations)

@app.route('/search', methods=['GET'])
def search():
    ''' search location by name '''
    activity_name = request.values.get('activity')
    return dumps(activity_help.get_activity_details(activity_name))

@app.route('/activities/nominate', methods=['POST'])
def nominate():
    ''' nominate activity '''
    body = request.get_json()
    group_id = body['group_id']
    google_places_id = body['google_places_id']
    activity_name = body['activity_name']
    rating = body['rating']
    photo_reference = body['photo_reference']
    category = body['category']
    group_activities.nominate(group_id, google_places_id, activity_name, rating, photo_reference, category)
    return dumps({})

@app.route('/activities/vote', methods=['POST'])
def vote():
    ''' vote for nominated activity '''
    body = request.get_json()
    activity_id = body['activity_id']
    access_token = body['token']
    group_activities.vote(activity_id, access_token)
    return dumps({})

@app.route('/activities/vote', methods=['DELETE'])
def unvote():
    ''' undo vote '''
    activity_id = request.values.get('activity_id')
    access_token = request.values.get('token')
    group_activities.unvote(activity_id, access_token)
    return dumps({})

@app.route('/poll/<group_id>', methods=['GET'])
def get_poll_result(group_id):
    ''' get poll result '''
    poll_result = group_activities.get_poll(group_id)
    return dumps(poll_result)

@app.route('/activities/suggest', methods=['GET'])
def suggest_activities():
    ''' take in the questionairre and return the activity suggestions '''
    location = request.values.get('location')
    nature = int(request.values.get('nature'))
    sightseeing = int(request.values.get('sightseeing'))
    sport = int(request.values.get('sport'))
    recreation = int(request.values.get('recreation'))
    picnic = int(request.values.get('picnic'))
    cultural = int(request.values.get('cultural'))
    questionairre = {
        'nature': nature,
        'sightseeing': sightseeing,
        'sport': sport,
        'recreation': recreation,
        'picnic': picnic,
        'cultural': cultural
    }
    suggestions = activity_help.suggest_activities_by_categories(questionairre, location)
    return dumps(suggestions)

@app.route('/side-activities/<group_id>', methods=['GET'])
def suggest_side_activities(group_id):    
    ''' suggest side activities '''
    return dumps(activity_help.suggest_side_activities(group_id))

@app.route('/side-activities', methods=['POST'])
def add_side_activity():
    ''' add side activities '''
    body = request.get_json()
    group_id = body['group_id']
    authoriser_token = body['token']
    google_places_id = body['google_places_id']
    activity_name = body['activity_name']
    rating = body['rating']
    photo_reference = body['photo_reference']
    category = body['category']
    activity_id = group_activities.add_side_activity(authoriser_token, group_id, google_places_id, activity_name, rating, photo_reference, category)
    schedule.add_schedule(group_id, activity_id, authoriser_token)
    return dumps({})

@app.route('/schedule', methods=['POST'])
def add_schedule():
    ''' add activity to schedule '''
    body = request.get_json()
    group_id = body['group_id']
    authoriser_token = body['token']
    activity_id = body['activity_id']
    schedule.add_schedule(group_id, int(activity_id), authoriser_token)
    return dumps({})

@app.route('/schedule/<group_id>', methods=['GET'])
def get_schedule(group_id):
    ''' get schedule '''
    output = schedule.get_schedule(group_id)
    return dumps(output)

@app.route('/schedule', methods=['PUT'])
def change_schedule():
    ''' change scheduled time of activity '''
    body = request.get_json()
    group_id = body['group_id']
    authoriser_token = body['token']
    activity_id = body['activity_id']
    start_time = body['start_time']
    end_time = body['end_time']
    schedule.change_schedule(group_id, int(activity_id), start_time, end_time, authoriser_token)
    return dumps({})

@app.route('/schedule/<group_id>', methods=['DELETE'])
def remove_schedule(group_id):
    ''' remove activity from schedule '''
    authoriser_token = request.values.get('token')
    activity_id = request.values.get('activity_id')
    schedule.remove_schedule(group_id, activity_id, authoriser_token)
    return dumps({})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)