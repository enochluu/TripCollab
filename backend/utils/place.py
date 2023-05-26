import requests
import base64

''' Interaction with Google Places API '''

API_key = 'AIzaSyBqH3tJVTFy2V7ReFjVevGqphXdTQNUWJA'
search_place_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' \
                + 'input={}&inputtype=textquery&' \
                + 'fields=place_id,name,types&key={}'

details_url = 'https://maps.googleapis.com/maps/api/place/details/json?' \
                + 'place_id={}&inputtype=textquery&' \
                + 'fields=opening_hours/weekday_text,rating,photo,review,formatted_address,website,formatted_phone_number&key={}'

search_by_type_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key={}&type={}&query={}'

rating_url = 'https://maps.googleapis.com/maps/api/place/details/json?' \
                + 'place_id={}&inputtype=textquery&' \
                + 'fields=rating&key={}'

location_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' \
                    + 'input={}&inputtype=textquery&fields=geometry&key={}'

search_nearby_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' \
                        + 'location={}&radius={}&type={}&key={}'

type_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' \
                + 'input={}&inputtype=textquery&' \
                + 'fields=types&key={}'

photo_url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth={}&photoreference={}&key={}'

def get_photo_content(photo_reference, width):
    ''' get photo content binary data and convert to string format '''
    url = photo_url.format(width, photo_reference, API_key)
    photo_content_binary = requests.post(url).content
    photo_content_byte = base64.b64encode(photo_content_binary)
    photo_content_string = photo_content_byte.decode('ascii')
    return photo_content_string

def search_place(place):
    ''' search information of the place with given name '''
    url = search_place_url.format(place, API_key)
    response = requests.get(url).json()
    return response

def search_details(google_places_id):
    ''' search place details information with given google_places_id '''
    url = details_url.format(google_places_id, API_key)
    response = requests.post(url).json()
    result = response.get('result')
    return result

def search_rating(place_id):
    ''' search rating of the given place '''
    url = rating_url.format(place_id, API_key)
    response = requests.post(url).json()
    result = response.get('result')
    rating = None
    if 'rating' in result:
        rating = int(result.get('rating'))
    return rating

def search_activity_by_type(activity_type, location):
    ''' search for activities of given type and located in given location '''
    url = search_by_type_url.format(API_key, activity_type, location)
    response = requests.get(url).json()
    result = response.get('results')
    return result

def search_activity_location(activity_name):
    ''' search for the geometric location (longitude and latitude) of given activity '''
    url = location_url.format(activity_name, API_key)
    response = requests.get(url).json()
    geometry = response['candidates'][0].get('geometry')
    return geometry.get('location')

def search_activity_type(activity_name):
    ''' search for the type of given activity '''
    url = type_url.format(activity_name, API_key)
    response = requests.get(url).json()
    result = response['candidates'][0]
    return result

def search_nearby(geo_location, radius, activity_type):
    ''' search for places nearby the given geometric location with in given radius '''
    url = search_nearby_url.format(geo_location, radius, activity_type, API_key)
    response = requests.get(url).json()
    result = response.get('results')
    return result