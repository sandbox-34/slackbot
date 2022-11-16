// Require the Bolt for JavaScript package (github.com/slackapi/bolt)
const { App, LogLevel } = require("@slack/bolt")

const app = new App({
	token: "xoxb-your-token",
	signingSecret: "your-signing-secret",
	// LogLevel can be imported and used to make debugging simpler
	logLevel: LogLevel.DEBUG,
})
// Listen to the app_home_opened Events API event to hear when a user opens your app from the sidebar
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
