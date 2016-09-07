// Saves options to chrome.storage
function save_options() {
  var personalAccessToken = document.getElementById('personal-access-token').value;
  chrome.storage.local.set({
    personalAccessToken: personalAccessToken
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Checking login...';
    qwest.get('https://api.github.com/user', null, {
      cache: true,
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: "token " + personalAccessToken
      }
    }).then(function(xhr, response) {
      var scopes = xhr.getResponseHeader("X-OAuth-Scopes").split(', ')
      if (scopes.indexOf('repo') != -1) {
        status.textContent = "Logged in!"
      } else {
        status.textContent = "Login failed! The personal access token is missing the \"repo\" scope."
      }
    }).catch(function(e, xhr, response) {
      status.textContent = xhr.statusText
    })
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    personalAccessToken: ""
  }, function(items) {
    document.getElementById('personal-access-token').value = items.personalAccessToken;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
