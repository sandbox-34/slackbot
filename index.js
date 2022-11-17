require("dotenv").config()
const { App } = require("@slack/bolt")

const port = 3000

const app = new App({
	token: process.env.SLACK_HLC_TOKEN,
	signingSecret: process.env.SLACK_HLC_SIGNING_SECRET,
	// socketMode: true,
	// appToken: process.env.SLACK_HLC_APP_TOKEN,
});

(async () => {
	await app.start(port)

	console.log(`🤖 Slack bot at your service (http://localhost:${port})`)
})()

app.event("app_home_opened", async ({ payload, client }) => {
	const userId = payload.user
	console.log('in here')

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