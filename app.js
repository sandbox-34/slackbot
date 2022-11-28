require("dotenv").config()
const { App, AwsLambdaReceiver } = require("@slack/bolt")

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
})

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: awsLambdaReceiver,

	// When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
	// If you use other Receivers, such as ExpressReceiver for OAuth flow support
	// then processBeforeResponse: true is required. This option will defer sending back
	// the acknowledgement until after your handler has run to ensure your handler
	// isn't terminated early by responding to the HTTP request that triggered it.

	// processBeforeResponse: true
})

app.action("birthday_collector", async ({ body, context, ack }) => {
	await ack()
	
	async function publishMessage(id) {
		try {
			// Call the chat.postMessage method using the built-in WebClient
			const result = await app.client.chat.postMessage({
				channel: id,
				text: "got it :)",		
				// You could also use a blocks[] array to send richer content
			})

			// Print result, which includes information about the message (like TS)
			console.log(result)
		} catch (error) {
			console.error(error)
		}
	}

	publishMessage(body.channel.id)

})


// send a message containing an input block for the user to respond to
app.command("/sendmessage", async ({ command, ack, say }) => {
	await ack()
	
	async function publishMessage(id) {
		try {
			// Call the chat.postMessage method using the built-in WebClient
			const result = await app.client.chat.postMessage({
				// The token you used to initialize your app
				// token: "xoxb-your-token",
				channel: id,
				// text: text,
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "Select Your Birthday",
						},
						accessory: {
							type: "datepicker",
							action_id: "birthday_collector",
							initial_date: "2000-01-01",
							placeholder: {
								type: "plain_text",
								text: "Select a date",
							},
						},
					},
				],
		
				// You could also use a blocks[] array to send richer content
			})

			// Print result, which includes information about the message (like TS)
			console.log(result)
		} catch (error) {
			console.error(error)
		}
	}

	publishMessage("U02SWAYMZ3N")
})
// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
	// say() sends a message to the channel where the event was triggered
	await say({
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `Hey there <@${message.user}>!`,
				},
				accessory: {
					type: "button",
					text: {
						type: "plain_text",
						text: "Click Me",
					},
					action_id: "button_click",
				},
			},
		],
		text: `Hey there <@${message.user}>!`,
	})
})

app.command("/getallchannels", async ({ command, ack, say }) => {
	console.log(command.text)
	const channelNameToLookup = command.text

	async function populateConversationStore() {
		try {
			// Call the conversations.list method using the WebClient
			const result = await app.client.conversations.list()

			const store = saveConversations(result.channels)
			const arrayOfStore = Object.entries(store).map((entry) => entry[1])
			const singleChannelInfo = arrayOfStore.find((channel) => channel.name === channelNameToLookup)
			const membersInChannel = await getAllMembersInChannel(singleChannelInfo.id)

			//send a message to each member in the channel
			membersInChannel.forEach((channel) => {
				app.client.chat.postMessage({
					channel: channel,
					text: "howdy",
				})
			})

			return JSON.stringify(membersInChannel)
		} catch (error) {
			console.error(error)
		}
	}

	async function getAllMembersInChannel(channelId) {
		try {
			// Call the conversations.members method using the WebClient
			const result = await app.client.conversations.members({
				channel: channelId,
			})
			return result.members
		} catch (error) {
			console.error(error)
		}
	}

	// Put conversations into the JavaScript object
	function saveConversations(conversationsArray) {
		let conversationsStore = {}
		let conversationId = ""

		conversationsArray.forEach(function (conversation) {
			// Key conversation info on its unique ID
			conversationId = conversation["id"]

			// Store the entire conversation object (you may not need all of the info)
			conversationsStore[conversationId] = conversation
		})
		return conversationsStore
	}

	// Acknowledge command request
	await ack()
	const store = await populateConversationStore()
	await say(store)
})

app.action("button_click", async ({ body, ack, say }) => {
	// Acknowledge the action
	await ack()
	await say(`<@${body.user.id}> clicked the button`)
})

// get all members in a specified channel
app.command("/echo", async ({ command, ack, say }) => {
	// Acknowledge command request
	await ack()
	console.log("here i am")
	console.log(command)

	await say(`${command.text}`)
})

app.event("app_home_opened", async ({ payload, client }) => {
	const userId = payload.user

	try {
		// Call the views.publish method using the WebClient passed to listeners
		const result = await client.views.publish({
			user_id: userId,
			view: {
				// Home tabs must be enabled in your app configuration page under "App Home"
				type: "home",
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "*Welcome home, <@" + userId + "> :house:*",
						},
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text:
								"Learn how home tabs can be more useful and interactive <https://api.slack.com/surfaces/tabs/using|*in the documentation*>.",
						},
					},
					{
						type: "divider",
					},
					{
						type: "context",
						elements: [
							{
								type: "mrkdwn",
								text:
									"Psssst this home tab was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>",
							},
						],
					},
				],
			},
		})

		console.log(result)
	} catch (error) {
		console.error(error)
	}
})

module.exports.handler = async (event, context, callback) => {
	const handler = await awsLambdaReceiver.start()
	return handler(event, context, callback)
}
