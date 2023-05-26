from werkzeug.exceptions import HTTPException
from json import dumps

''' Define error types for backend '''

class ValueError(HTTPException):
    ''' Error code 400 (Bad Request) '''
    code = 400
    name = 'Value Error'
    message = 'No message specified'

class AuthorizationError(HTTPException):
    '''Error code 401 (Unauthorised)'''
    code = 401
    name = 'Authorization Error'
    message = 'No message specified'

class AccessError(HTTPException):
    ''' Error code 403 (Forbidden) '''
    code = 403
    name = 'Access Error'
    message = "No message specified"

class ServerError(HTTPException):
    ''' Error code 500 (Internal Server Error) '''
    code = 500
    name = 'Server Error'
    message = 'No message specified'

def default_handler(err):
    ''' exception handler '''
    response = err.get_response()
    response.data = dumps({
        'code': err.code,
        'name': err.name,
        'message': err.get_description(),
    })
    response.content_type = 'application/json'
    return response