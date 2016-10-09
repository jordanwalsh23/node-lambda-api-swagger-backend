var ApiBuilder = require('claudia-api-builder'),
  api = new ApiBuilder();

var unirest = require('unirest');

//Default Endpoint, used for retrieval of the Gist data.
api.get("/", function(req) {

  var modal = req.queryString['modal'];
  var githubToken = req.queryString['githubToken'];
  var githubUsername = req.queryString['githubUsername'];

  if(modal && modal != "") {
    //We're in the modal
    var url = "https://api.github.com/users/" + githubUsername + "/gists";

    console.log("URL is: " + url);

    return new Promise((resolve, reject) => {
      var Request = unirest.get(url)
      .headers({
        "User-Agent" : "Swagger Node.js Backend"
      })
      .auth({
        user: '',
        password: githubToken,
        sendImmediately: true
      })
      .send()
      .end(function(response) {
        resolve(response.body);
      });
    });

  } else {
    return "#Please select a file from the menu.";
  }
});

//PUT request to support update
api.put("/", function(req) {
  // 1. we want to get the ID and filename of the GIST from the Post data
  // 2. we want to see if the current postData is the same as the gist
  // 3. if it has changed, we want to update it

  var gistId = "";
  var gistFilename = "";
  var gistDescription = "";

  var githubToken = req.headers['x-github-token'];

  console.log("Performing the PUT. Token is: " + githubToken);

  try {
    console.log("parsing the request body");
    console.log(req.body);

    var body;

    if( typeof req.body == "object" ) {
      body = req.body;
    } else if ( typeof req.body == "string" && req.body != "" ) {
      body = JSON.parse(req.body);
    } else {
      throw "Couldn't parse body";
    }
    
    var info = body["info"];

    if(info['x-gist-id']) {
      gistId = info['x-gist-id'];
    }

    if(info['x-gist-filename']) {
      gistFilename = info['x-gist-filename'];
    }

    if(info['x-gist-description']) {
      gistDescription = info['x-gist-description'];
    }

    console.log("GistID: " + gistId);
    console.log("gistFilename: " + gistFilename);
    console.log("gistDescription: " + gistDescription);

    if( gistId != "" && gistFilename != "" ) {

      console.log("Doing GET");

      var url = "https://api.github.com/gists/" + gistId;

      return new Promise((resolve, reject) => {
        var Request = unirest.get(url)
        .headers({
          "User-Agent" : "Swagger Node.js Backend"
        })
        .auth({
          user: '',
          password: githubToken,
          sendImmediately: true
        })
        .send()
        .end(function(response) {
          var jsonGist = response.body;
          var currentContent = jsonGist['files'][gistFilename]['content'];

          if(currentContent == body) {
            console.log('No update required');
            resolve(new api.ApiResponse({
              "result" : "The current gist and the new gist are the same. No change is required."
            }, {'Content-Type': 'application/json'}, 304));
          } else {
            //Set up the object that we are going to update into Gist

            var update = {
              "description" : gistDescription,
              "files" : {}
            };

            update.files[gistFilename] = {
              "content" : JSON.stringify(body)
            };

            console.log(update);

            var url = "https://api.github.com/gists/" + gistId;

            var Request = unirest.patch(url)
            .headers({
              "User-Agent" : "Swagger Node.js Backend"
            })
            .auth({
              user: '',
              password: githubToken,
              sendImmediately: true
            })
            .send(JSON.stringify(update))
            .end(function(response) {
              console.log("Response:");
              console.log(response);
              resolve(JSON.stringify(body));
            });
          }
        });
      });
    } else {
      var error = {
        "errorCode" : "1000",
        "errorText" : "No x-gist-id or x-gist-filename supplied in the document"
      };
      return new api.ApiResponse(JSON.stringify(error), {'Content-Type': 'application/json'}, 404);
    }

  } catch (e) {
    console.log(e);
    return new api.ApiResponse('an error occurred: ' + e, {'Content-Type': 'text/plain'}, 400);
  }
});

module.exports = api;
