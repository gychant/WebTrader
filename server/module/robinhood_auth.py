"""
Module for interacting with Robinhood Authentication
"""
import module.robinhood.helper as helper
import module.robinhood.urls as urls
from module.robinhood.authentication import \
    generate_device_token, \
    respond_to_challenge
from utils.logging import logger


class RobinhoodAuth(object):
    def __init__(self):
        pass

    def login_server(self, username="", password="", 
            challenge_id=None, sms_code=None, device_token=None):
        data = self.login(username=username, password=password, 
            expiresIn=86400, by_sms=True, challenge_id=challenge_id,
            sms_code=sms_code, device_token=device_token)
        return data

    def logout(self):
        helper.update_session('Authorization', None)
        return True

    def login(self, username=None, password=None, expiresIn=86400, 
              scope='internal', by_sms=True, store_session=True, 
              mfa_code=None, challenge_id=None, sms_code=None, 
              device_token=None):
        """This function will effectively log the user into robinhood by getting an
        authentication token and saving it to the session header. By default, it
        will store the authentication token in the database and load that value
        on subsequent logins.
        :param username: The username for your robinhood account, usually your email.
            Not required if credentials are already cached and valid.
        :type username: Optional[str]
        :param password: The password for your robinhood account. Not required if
            credentials are already cached and valid.
        :type password: Optional[str]
        :param expiresIn: The time until your login session expires. This is in seconds.
        :type expiresIn: Optional[int]
        :param scope: Specifies the scope of the authentication.
        :type scope: Optional[str]
        :param by_sms: Specifies whether to send an email(False) or an sms(True)
        :type by_sms: Optional[boolean]
        :param store_session: Specifies whether to save the log in authorization
            for future log ins.
        :type store_session: Optional[boolean]
        :param mfa_code: MFA token if enabled.
        :type mfa_code: Optional[str]
        :returns:  A dictionary with log in information. The 'access_token' keyword contains the access token, and the 'detail' keyword \
        contains information on whether the access token was generated or loaded from pickle file.
        """
        if device_token is None:
            if helper.SESSION() is not None:
                device_token = helper.SESSION().headers.get("device_token", None)
            if device_token is None:
                device_token = generate_device_token()

        # Challenge type is used if not logging in with two-factor authentication.
        if by_sms:
            challenge_type = "sms"
        else:
            challenge_type = "email"

        url = urls.login_url()
        payload = {
            'client_id': 'c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS',
            'expires_in': expiresIn,
            'grant_type': 'password',
            'password': password,
            'scope': scope,
            'username': username,
            'challenge_type': challenge_type,
            'device_token': device_token
        }

        if mfa_code:
            payload['mfa_code'] = mfa_code

        if challenge_id is None:
            try:
                access_token = None
                token_type = None
                refresh_token = None
                if store_session:
                    access_token = helper.SESSION().headers.get("access_token", None)
                    token_type = helper.SESSION().headers.get("token_type", None)
                    refresh_token = helper.SESSION().headers.get("refresh_token", None)

                if access_token is not None:
                    helper.update_session('Authorization', '{0} {1}'.format(token_type, access_token))
                else:
                    helper.update_session('Authorization', None)

                # Try to load account profile to check that authorization token is still valid.
                res = helper.request_get(urls.portfolio_profile(), 'regular', payload, jsonify_data=False)
                # Raises exception is response code is not 200.
                res.raise_for_status()

                return {
                    'username': username,
                    'access_token': access_token, 
                    'token_type': token_type,
                    'expires_in': expiresIn, 
                    'scope': scope, 
                    'detail': 'logged in using authentication from local session',
                    'backup_code': None, 
                    'refresh_token': refresh_token
                }
            except:
                logger.info("Authentication may be expired - logging in normally.")
                helper.update_session('Authorization', None)
                data = helper.request_post(url, payload)
                if 'challenge' in data:
                    # Return device_token to client
                    data["challenge"]["device_token"] = device_token
        else:
            res = respond_to_challenge(challenge_id, sms_code)
            helper.update_session('X-ROBINHOOD-CHALLENGE-RESPONSE-ID', challenge_id)
            data = helper.request_post(url, payload)

        # Update Session data with authorization or raise exception with the information present in data.
        if 'access_token' in data:
            logger.info("Adding Robinhood session...")
            helper.add_session(data['access_token'], data['token_type'])
            token = '{0} {1}'.format(data['token_type'], data['access_token'])
            helper.update_session('Authorization', token)
            data['detail'] = "logged in with brand new authentication code."
            data['username'] = username
        return data