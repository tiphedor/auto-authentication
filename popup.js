let tokensList = []

// Get the initial token list
chrome.storage.sync.get('sitesTokens', items => {
	// For the first time users, init the sitesToken to an empty array
	if (!Array.isArray(items.sitesTokens)) {
		chrome.storage.sync.set({ 'sitesTokens': [] })
	} else {
		// Otherwise, retrive the tokens list from chrome storage
		tokensList = items.sitesTokens
	}

	// """start""" the app (kinda, chill.)
	updateUI()
})

// Subscribe to Chrome Storage Updates
chrome.storage.onChanged.addListener(function(changes, area) {
	if (area == "sync" && "sitesTokens" in changes) {
		tokensList = changes.sitesTokens.newValue;
	}
})

// Re-generate the token list, called after all changes on tokensList
const updateUI = () => {
	$('.list').html('')
	let dom = ''

	if (tokensList.length === 0) {
		dom = `
			<div class="mui--text-display1 noTokensMessage">
				You currently have no tokens stored.<br/>Start by adding one !
			</div>
		`
	}
	
	for (let i = 0; i < tokensList.length; i++) {
		const token = tokensList[i]
		dom += `
			<div class="mui-row">
				<div class="mui-panel tokenListItem">
					<div class="mui-col-md-10">
						<div class="tokenLabel">${token.url || `/${token.regex}/`} - Basic Auth</div>
					</div>
					<div class="mui-col-md-2">
						<button data-index='${i}' class="mui-btn mui-btn--danger btnDelete">delete</button>
					</div>
				</div>
			</div>`
	}

	$('.list').html(`<div class="mui-container-fluid">${dom}</div>`)
}

$('.btnAdd').click(() => {
	const username = $('.authBasicUsername').val()
	const password = $('.authBasicPassword').val()
	const urlStr = $('.url').val()

	if (!username || !password || !urlStr) {
		$('.errorMessage').show()
		setTimeout(() => $('.errorMessage').fadeOut(), 1200)
		return
	}

	const newToken = {
		headerName: 'Authorization',
		headerValue: `Basic ${btoa(`${username}:${password}`)}`
	}

	if (urlStr.startsWith('/') && urlStr.endsWith('/')) {
		// User typed a regex (or something that looks like a regex)
		const regexStr = urlStr.substring(1, urlStr.length - 1);
		newToken.regex = regexStr
	} else {
		// Simple domain.
		newToken.url = urlStr
	}

	// Adds the new token to the list
	tokensList.push(newToken)
	chrome.storage.sync.set({ 'sitesTokens': tokensList })

	// Show the success message
	$('.okMessage').show()
	setTimeout(() => $('.okMessage').fadeOut(), 700)

	// Update the token list
	updateUI()

	// Clears form
	$('.authBasicUsername').val('')
	$('.authBasicPassword').val('')
	$('.url').val('')
})

$('body').on('click', '.btnDelete', e => {
	const indexToDelete = event.target.attributes['data-index'].value
	tokensList.splice(indexToDelete, 1)
	chrome.storage.sync.set({ 'sitesTokens': tokensList })
	updateUI()
})