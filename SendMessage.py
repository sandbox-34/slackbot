import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

client = WebClient(token=os.environ.get('SLACK_BOT_TOKEN'))

def getAllChannels():
    try:
        result = client.conversations_list()
        channels = []
        for channel in result["channels"]:
            channels.append({channel["id"]: channel["name"]})
        return channels

    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        print(f"Got an error: {e.response['error']}")

def getMembersInChannel(channelId):
    try:
        response = client.conversations_members(channel=channelId)
        return response['members']
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        print(f"Got an error: {e.response['error']}")

def getAllUsers():
    try:
        result = client.users_list()
        users = []
        for user in result["members"]:
            users.append({user["id"]: user["name"]})
        return users

    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        print(f"Got an error: {e.response['error']}")

def getUserInfo(userId):
    try:
        response = client.users_info(user=userId)
        return response['user']
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        print(f"Got an error: {e.response['error']}")

def sendMessage (channelList, message):
    try:
        for channelName in channelList:
            userInfo = getUserInfo(channelName)
            message = 'Hey ' + userInfo['profile']['first_name'] + '! ' + message
            # response = client.chat_postMessage(channel=channelName, text="Hello User: " + str(channelName))
            response = client.chat_postMessage(channel=channelName, text=message)
        print(response)
        # assert response["message"]["text"] == "Hello world!"
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        assert e.response["error"]  # str like 'invalid_auth', 'channel_not_found'
        print(f"Got an error: {e.response['error']}")

# TODO put in the channel name you want to look up and the message you want to send here:
    # The message will be appended to a text that says "Hey <first_name>, <message>". You can change that in the "sendMessage" function
channelNameToLookup = "jackson-test"
message = "\nThis is a test message"

channelInfo = [channel for channel in getAllChannels() if channelNameToLookup in channel.values()][0]
channelMembers = getMembersInChannel(list(channelInfo.keys())[0])

# TODO UNCOMMENT THE NEXT LINE WHEN YOU ARE READY TO SEND THE MESSAGE
sendMessage(channelMembers, message)