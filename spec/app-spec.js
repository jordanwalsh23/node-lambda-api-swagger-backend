var app = require("../app");

describe("appTests", () => {
  var lambdaContextSpy;

  beforeEach(() => {
    lambdaContextSpy = jasmine.createSpyObj('lambdaContext', ['done']);
  });

  it('returns a string when no arguments are supplied', (done) => {
    app.proxyRouter({
      requestContext: {
        resourcePath: '/',
        httpMethod: 'GET'
      },
      queryStringParameters: {},
      stageVariables: {}
    }, lambdaContextSpy).then(() => {
      expect(lambdaContextSpy.done).toHaveBeenCalledWith(null,
        jasmine.objectContaining({
          statusCode : 200,
          headers : {
            "Content-Type" : 'application/json',
            "Access-Control-Allow-Origin" : '*',
            "Access-Control-Allow-Headers" : 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            "Access-Control-Allow-Methods" : 'GET,PUT,OPTIONS'
          },
          body:'"#Please select a file from the menu."'
        })
      );
    }).then(done, done.fail);
  });

  it('returns nothing when performing a PUT', (done) => {
    app.proxyRouter({
      requestContext: {
        resourcePath: '/',
        httpMethod: 'PUT'
      },
      body : {
        "info" : {
          "x-gist-id" : "gist1",
          "x-gist-filename" : "gist-fn",
          "x-gist-description" : "gist-desc"
        }
      },
      headers : {
        "x-github-token" : "abc123"
      },
      queryStringParameters: {},
      stageVariables: {}
    }, lambdaContextSpy).then(() => {
      expect(lambdaContextSpy.done).toHaveBeenCalledWith(null,
        jasmine.objectContaining({
          statusCode : 200,
          headers : {
            "Content-Type" : 'application/json',
            "Access-Control-Allow-Origin" : '*',
            "Access-Control-Allow-Headers" : 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            "Access-Control-Allow-Methods" : 'GET,PUT,OPTIONS'
          },
          body:'{}'
        })
      );
    }).then(done, done.fail);
  });
});
