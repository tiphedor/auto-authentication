let tokensList

// Get the initial tokens list
chrome.storage.sync.get('sitesTokens', items => {
	tokensList = Array.isArray(items.sitesTokens) ? items.sitesTokens : []
})

// Retrive the new token list when it changes
chrome.storage.onChanged.addListener(function(changes, area) {
	if (area == "sync" && "sitesTokens" in changes) {
		tokensList = changes.sitesTokens.newValue;
	}
})

// On each request ...
chrome.webRequest.onBeforeSendHeaders.addListener(({ url, requestHeaders }) => {
	const currentSiteToken = tokensList.filter(token => url.includes(token.url))[0]
	
	if (currentSiteToken) {
		requestHeaders.push({
			name: currentSiteToken.headerName,
			value: currentSiteToken.headerValue
		})
	}
	return { requestHeaders }
}, { urls: ['*://*/*'] }, ['requestHeaders', 'blocking']);

