# About Heroku

Heroku is a cloud application host. They describe their service as follows:

> Heroku provides you with all the tools you need to iterate quickly, and adopt the right technologies for your project. Build modern, maintainable apps and instantly extend them with functionality from hundreds of cloud services providers without worrying about infrastructure.

# How to deploy VersionOne.Client.Requestor in Heroku for free

You can deploy this code in Heroku under a free account. But, first be aware of this **security caveat**:

If you do it this way, you should take care to create a user in your VersionOne instance who has limited permissions, because it requires a plaintext username and password to be stored in config.js. **We welcome pull requests from developers who come up with more secure solutions for this.**

## Steps

* Fork this repository to your own GitHub account.
* Follow these instructions for [modifying config.js](README.md#configjs) to point to your own VersionOne instance, and to have the correct authentication.
* Open up this document you are reading right now and modify the code for the **Deploy** button that you see below by swapping the `https://github.com/versionone` part with the path to your newly forked copy.
* Save the file.
* Press the *Deploy* button! This will walk you through the steps to create the free account and the app!

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/versionone/VersionOne.Client.Requestor/)