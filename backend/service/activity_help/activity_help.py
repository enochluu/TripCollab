import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from utils import place
from service.group_plan import group_activities
from config.exception import ValueError

''' Implementation for activity suggestions and search '''

sightseeing_types = ['tourist_attraction']
nature_types = ['park']
cultural_types = ['art_gallery', 'museum', 'university', 'library']
recreation_types = ['aquarium', 'amusement_park', 'movie_theater']
sport_types = ['gym']
picnic_types = ['park', 'zoo']

def determine_category(types):
    ''' determine activity category based on their types '''
    if set(nature_types) & set(types):
        return 'Nature'
    elif set(picnic_types) & set(types):
        return 'Picnic'
    elif set(sport_types) & set(types):
        return 'Sport'
    elif set(cultural_types) & set(types):
        return 'Cultural'
    elif set(sightseeing_types) & set(types):
        return 'Sightseeing'
    elif set(recreation_types) & set(types):
        return 'Recreation'
    else:
        return 'Miscellaneous'

def get_photo_references(photo_response):
    ''' get four photo references of activity '''
    photo_references = []
    counter = 0
    for photo_info in photo_response:
        if counter >= 4:
            break
        photo_references.append(photo_info['photo_reference'])
        counter += 1
    return photo_references

def get_activity_details(activity_name):
    ''' get all information needed for activity details page of an activity '''
    response = place.search_place(activity_name)
    if len(response['candidates']) == 0:
        raise ValueError(f"Location '{activity_name}' not found")
    place_info = response['candidates'][0]
    place_name = place_info.get('name')
    category = 'miscellaneous'
    if 'types' in place_info:
        category = determine_category(place_info.get('types'))
    google_places_id = place_info.get('place_id')
    result = place.search_details(google_places_id)
    address = result.get('formatted_address')
    phone_number = result.get('formatted_phone_number')
    rating = None
    if 'rating' in result:
        rating = int(result.get('rating'))
    website = result.get('website')
    photos = []
    if 'photos' in result:
        photo_references = get_photo_references(result.get('photos'))
    opening_hours = None
    if 'opening_hours' in result:
        opening_hours = result['opening_hours']['weekday_text']
    reviews = result.get('reviews')
    return {
        'google_places_id': google_places_id,
        'place_name': place_name,
        'rating': rating,
        'photo_references': photo_references,
        'address': address,
        'opening_hours': opening_hours,
        'phone_number': phone_number,
        'website': website,
        'category': category,
        'reviews': reviews
    }

def get_activity_info(result, count):
    ''' get a list of basic information of given number of activities in the search result '''
    activity_info = []
    for i in range(0, count):
        if i >= len(result):
            break
        info = result[i]
        place_id = info.get('place_id')
        photo_reference = None
        if 'photos' in info:
            photo_reference = info['photos'][0]['photo_reference']
        activity_name = info.get('name')
        rating = place.search_rating(place_id)
        activity_info.append(
            {
                'google_places_id': place_id,
                'activity_name': activity_name,
                'rating': rating,
                'photo_reference': photo_reference,
                'photo_content': place.get_photo_content(photo_reference, 500)
            }
        )
    return activity_info

def get_activities_by_type(activity_type, location, count):
    ''' get activity suggestions based on type and trip location '''
    result = place.search_activity_by_type(activity_type, location)
    return get_activity_info(result, count)

def suggest_activities_by_categories(questionairre, location):
    ''' 
    get activity suggestions based on user preference in questionnaire and trip location 
    '''
    suggestions = []
    highest_score = max(questionairre.values())
    preference = [k.lower() for k,v in questionairre.items() if v == highest_score]
    preferred_type_list = globals()[preference[0]+'_types']
    first_type = preferred_type_list[0]
    second_type = preferred_type_list[-1]
    if len(preference) == 1:
        suggestions.extend(get_activities_by_type(first_type, location, 2))
        suggestions.extend(get_activities_by_type(second_type, location, 1))
        for activity in suggestions:
            activity['category'] = preference[0].capitalize()
    elif len(preference) == 2:
        suggestions.extend(get_activities_by_type(first_type, location, 1))
        suggestions.extend(get_activities_by_type(second_type, location, 1))
        for activity in suggestions:
            activity['category'] = preference[0].capitalize()
        preferred_type_list = globals()[preference[1]+'_types']
        third_type = preferred_type_list[0]
        suggestions.extend(get_activities_by_type(third_type, location, 1))
        suggestions[-1]['category'] = preference[1].capitalize()
    else:
        first_type = globals()[preference[0]+'_types'][0]
        second_type = globals()[preference[1]+'_types'][0]
        third_type = globals()[preference[2]+'_types'][0]
        suggestions.extend(get_activities_by_type(first_type, location, 1))
        suggestions[0]['category'] = preference[0].capitalize()
        suggestions.extend(get_activities_by_type(second_type, location, 1))
        suggestions[-1]['category'] = preference[1].capitalize()
        suggestions.extend(get_activities_by_type(third_type, location, 1))
        suggestions[-1]['category'] = preference[2].capitalize()
    # get distinct suggestions
    suggestions = list({s['google_places_id']:s for s in suggestions}.values())
    suggestion_count = len(suggestions)
    if suggestion_count < 3:
        more_activities = get_activities_by_type(first_type, location, 3)
        suggestions.extend(more_activities)
        # get distinct suggestions
        suggestions = list({s['google_places_id']:s for s in suggestions}.values())
        # get three suggestions
        suggestions = suggestions[:3]
    return suggestions

def get_activity_category(activity_name):
    ''' determine the category of given activity '''
    result = place.search_activity_type(activity_name)
    category = 'miscellaneous'
    if 'types' in result:
        category = determine_category(result.get('types'))
    return category

def get_nearby_activity_of_type(geo_location, activity_type):
    ''' suggest one nearby activity of given type '''
    # search nearby within a radius of 3000m
    nearby_radius = 3000
    result = place.search_nearby(geo_location, nearby_radius, activity_type)
    suggestion = get_activity_info(result, 1)
    return suggestion

def get_nearby_activities(activity_name):
    ''' get activities nearby the given activity '''
    location_info = place.search_activity_location(activity_name)
    lat = location_info.get('lat')
    lng = location_info.get('lng')
    geo_location = str(lat) + ',' + str(lng)
    suggestions = get_nearby_activity_of_type(geo_location, 'cafe')
    suggestions.extend(get_nearby_activity_of_type(geo_location, 'restaurant'))
    suggestions.extend(get_nearby_activity_of_type(geo_location, 'lodging'))
    # remove duplicates from suggestions
    suggestions = list({s['google_places_id']:s for s in suggestions}.values())
    for activity in suggestions:
        activity['category'] = 'Miscellaneous'
    return suggestions

def suggest_side_activities(group_id):
    ''' suggest side activities for given group '''
    suggestions = []
    main_activities = group_activities.get_main_activity_names(group_id)
    for activity_name in main_activities:
        suggestions.append(
            {
                'main_activity': activity_name,
                'suggestions': get_nearby_activities(activity_name)
            }
        )
    return suggestions