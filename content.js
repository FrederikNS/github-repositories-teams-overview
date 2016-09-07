knownTeams = {}

function enrichTeam(el, response) {
  if (response.length > 0) {
    teamNames = response.map(function(team) {return `<a href="https://github.com/orgs${window.location.pathname}/teams/${team.slug}">${team.name}</a>`})

    var teamElement = document.createElement('div')
    teamElement.style.color = "#666"
    teamElement.innerHTML = `Teams: ${teamNames.join(', ')}`

    descriptionNode = el.querySelector('.repo-list-meta')
    descriptionNode.parentNode.insertBefore(teamElement, descriptionNode)
  }
}

function enrichTeams() {
  chrome.storage.local.get(function(items) {
    if (items.personalAccessToken) {
      var repos = document.querySelectorAll('.repo-list>.repo-list-item')

      _.each(repos, function(el) {
        var repoName = el.querySelector('.repo-list-name>a').pathname
        if (knownTeams.hasOwnProperty(repoName)) {
          enrichTeam(el, knownTeams[repoName])
        } else {
          qwest.get(`https://api.github.com/repos${repoName}/teams`, null, {
            cache: true,
            headers: {
              Accept: "application/vnd.github.v3+json",
              Authorization: `token ${items.personalAccessToken}`
            }
          }).then(function(xhr, response) {
            knownTeams[repoName] = response
            enrichTeam(el, response)
          })
        }
      })
    }
  })
}
enrichTeams()
var repoList = document.querySelector('.repo-list')
var observer = new MutationObserver(enrichTeams)
observer.observe(repoList, {childList: true})
//
// enrichTeams()
//
// document.addEventListener('pjax:end', function() {
//   console.log('event fired')
//   enrichTeams()
// })
// document.querySelectorAll('.repo-list')[0].addEventListener('', function() {
//   console.log('event fired')
//
//   enrichTeams()
// })
