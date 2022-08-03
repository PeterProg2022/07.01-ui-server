07.01-ui-server angepasst damit es auf vercel läuft.

vercel settings:
	zwei deploys:
	api
		Build & Development Settings
			alle ovverride mit ''
		Root Directory:
			api
			Include source files outside of the Root Directory in the Build Step: no
	ui
		Build & Development Settings
			build command: npm run compile
		Root Directory:
			ui
			Include source files outside of the Root Directory in the Build Step: no (egal)

verwendung
	remote:	https://07-01-ui-server.vercel.app/
	local:
		ui
			npm run compile
			npm run start
		api
			npm run start
