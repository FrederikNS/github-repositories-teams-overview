knownTeams = {}

function enrichTeam(el, response) {
  if (response.length > 0) {
    teamNodes = response.map(function(team) {
      var elem = document.createElement('a')
      elem.textContent = team.name
      elem.setAttribute('href', `https://github.com/orgs${window.location.pathname}/teams/${team.slug}`)
      return elem
    })

    var teamElement = document.createElement('div')
    teamElement.style.color = '#666'
    teamElement.textContent = 'Teams: '

    var teamNodesWithSeparators = _.chain(teamNodes)
      .map(function(v) {return [v, document.createTextNode(', ')]})
      .reduce(function(a,b) {return a.concat(b)})
      .initial()
      .value()

    _.each(teamNodesWithSeparators, function(v) {
      teamElement.append(v)
    })

    descriptionNode = el.querySelector('.d-inline-block')
    descriptionNode.append(teamElement)
  }
}

function enrichTeams() {
  chrome.storage.local.get(function(items) {
    if (items.personalAccessToken) {
      var repos = document.querySelectorAll('.repo-list>li')

      _.each(repos, function(el) {
        var repoName = el.querySelector('.d-inline-block a').pathname
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

console.log("Ping!")
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
