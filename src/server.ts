import { bootstrap } from "./app";
import { env } from "./env";

bootstrap().then(({ app }) => {
	app.listen({
		host: '0.0.0.0',
		port: env.PORT,
	}, () => {
		console.log(`Server running on port ${env.PORT}`)
	})
})