![Powered by VersionOne](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/VersionOne.FeatureRequestor/images/poweredbyv1.png)

##VersionOne.CorsProxy

In the past if you wanted to use [VersionOne Requestor](https://github.com/versionone/VersionOne.Client.Requestor) you were forced to enable CORS in your VersionOne IIS server. That is no longer the case since now you can easily use VersionOne.CorsProxy when enabling CORS is not an option.

##Deploy
If you want to quickly deploy without needing to host the proxy yourself you just need to click the next button:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/kunzimariano/VersionOne.CorsProxy)

You only need to create a free heroku account if you don't already have one.

##How to use it
Once you have it deployed you just need to to pass the url you want to proxy as a parameter in the next way:
`http://yourCorsProxy/https://www.targert-url.com`
