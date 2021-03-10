endtoend:
	npm run cy-e2e

ui:
	npm run cy-ui

run:
	npm run cy-tstrnr-e2e

runui:
	npm run cy-tstrnr-ui

container:
	docker run -d -p 4200:80 vprodemo.azurecr.ui/samplewebui:latest

test-container:
	docker run -d -p 4201:80 vprodemo.azurecr.ui/samplewebui:latest


