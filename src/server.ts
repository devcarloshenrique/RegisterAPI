import { bootstrap } from "./app";
import { env } from "./env";

bootstrap().then(({ app }) => {
	app.listen({
		host: '0.0.0.0',
		port: env.PORT,
	}, () => {
		console.log(
			`API: http://localhost:${env.PORT}\n` +
			`Documentação Swagger: http://localhost:${env.PORT}/docs\n` +
			`Dashboard Bull Board: http://localhost:${env.PORT}/admin/queues`
		)
	})
})