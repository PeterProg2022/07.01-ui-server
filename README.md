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

			curl --request POST   --header 'content-type: application/json'   --url 'https://07-01-api.vercel.app/graphql'   --data '{"query":"{about}"}'
		db:
create db
	login
		https://account.mongodb.com/
		peter.prog@yahoo.com
		9Lr75ezMwwFXfpcNjo9m
	create organisation
		https://cloud.mongodb.com/v2#/preferences/organizations
		create organisation
		Name Your Organization
		MongoDB Atlas
		Next
		Create organisation
	create project
		links Projects
		New Project
		Project name
		Next
		Create Project
	create database
		links oben wähle Organisation und Project
		links database
		build a database
		shared
		wähle Cloud Provider & Region
		optional Cluster Name
		create cluster
	security
		links security-quickstart
		How would you like to authenticate your connection?
			username und password		issuetracker_user	2erllKuWsYj8e5Rr
			create user
		Where would you like to connect from?
			Cloud Environment
			IP Access List: 0.0.0.0/0
			finish and close
	get mongo-link
		links deployment - database
		connect
			with mongodb shell
			i have installed
			mongosh
			copy link (mongosh "mongodb+srv://cluster0.qxehy0z.mongodb.net/myFirstDatabase" --apiVersion 1 --username issuetracker_user)
	mongosh
		<Database> muss nicht vorhanden sein
		interaktiv
			mongosh "mongodb+srv://cluster0.qxehy0z.mongodb.net/<Database>" --apiVersion 1 --username issuetracker_user --password 2erllKuWsYj8e5Rr
		script
			mongosh "mongodb+srv://cluster0.qxehy0z.mongodb.net/<Database>" --apiVersion 1 --username issuetracker_user --password 2erllKuWsYj8e5Rr api/scripts/init.mongo.js

			webapp: gehe auf cluster - collections
			DATABASES: 1 COLLECTIONS: 2
	api/curl
		in api
		url = 'mongodb+srv://issuetracker_user:2erllKuWsYj8e5Rr@cluster0.qxehy0z.mongodb.net/<Database>?retryWrites=true&w=majority';
		curl --request POST   --header 'content-type: application/json'   --url 'localhost:4000/graphql'   --data '{"query":"{issueList{id,status,title}}"}' | jq

