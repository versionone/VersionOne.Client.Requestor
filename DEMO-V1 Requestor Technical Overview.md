# Understanding REST APIs with JSON: Technical Walkthrough of VersionOne Requestor Sample App

In the last article, we took a tour of the VersionOne Requestor App, a simple tool that you can customize to your needs 
to make it easier for your customers to provide "Feature Requests" that get saved inside of your VersionOne instance.

This app serves as a perfect diving board for us to now understand how it all works under the hood. This will help
you understand the basics of HTTP and RESTful APIs and how to use the VersionOne RESTful APIs.

## Table of Contents

- [Peeling the onion](#peeling-the-onion)
- [What you'll need](#what-youll-need)
- [Super simple intro to HTTP](#super-simple-intro-to-http)
 - [HTTP lets your browser get resources from, and post resources to remote web servers](#http-lets-your-browser-get-resources-from-and-post-resources-to-remote-web-servers)
 - [HTTP verbs tell remote web servers how to act](#http-verbs-tell-remote-web-servers-how-to-act)
- [A state of REST](#a-state-of-rest)
- [Known issues](#known-issues)
- [Home](#home)
- [Search for a project](#search-for-a-project)
- [Select project to pull up a new Request form](#select-project-to-pull-up-a-new-request-form)
- [Enter new Request details](#enter-new-request-details)
- [Save new Request](#save-new-request)
- [Select Request from list](#select-request-from-list)
- [Modify and save Request](#modify-and-save-request)
- [View Requests List in VersionOne](#view-requests-list-in-versionone)
- [View Request Detail in VersionOne](#view-request-detail-in-versionone)
- [Edit Request in VersionOne](#edit-request-in-versionone)

## Peeling the onion

We're going to take the same steps we did in the last article, but we will also show what's happening under the hood now
, but using Google Chrome's Developer Tools features.

## What you'll need

* You need to understand the basic ideas of HTTP. We'll explain them in brief, but to get a better grounding, 
visit the [How does the Internet Work?](http://docs.webplatform.org/wiki/concepts/internet_and_web/how_does_the_internet_work) 
topic from [http://www.WebPlatform.org](WebPlatform.org), or the [HTTP article](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) 
from Wikipedia.
* Google Chrome because of its Developer Tools.

## Super simple intro to HTTP

If you read the links above, or already understand HTTP, you can skip ahead to the `A state of REST` section.

### HTTP lets your browser *get* resources from, and *post* resources to remote web servers

It's likely that everyday, you see or type `http://www.google.com` in your web browser's address bar. 
HTTP stands for Hypertext Transfer Protocol. This protocol provides a small set of commands, called *verbs*, used by 
your web browser to **get** resources (documents, images, scripts, etc) from remote web servers. It also lets your 
browser **post** resources (data from search forms, your Facebook status updates, your credit card number) to remote 
web servers. 

That's the basic summary! While there are, of course, technical details involved, two of the commands, in fact the two 
most used by far, are actually named **get** and  **post**. 

When you type `http://www.google.com` and hit enter in the browser address bar, your browser sends the `get` verb to the 
server, and the server returns a resource (web page) that gives you back a search form.

When you then type in `good REST api tutorials` and hit enter, your browser sends the `post` verb back to Google's web 
server, along with the phrase `good REST api tutorials` as a resource. Google reads the resource data, and it uses it 
to find results for you that match.

In just a few moments, we'll show you how to ***spy*** on your web browser while it does this, so you can see this in 
action.

Wikipedia says this about HTTP:

> HTTP functions as a request-response protocol in the client-server computing model. A web browser, for example, may be the client and an application running on a computer hosting a web site may be the server. The client submits an HTTP request message to the server. The server, which provides resources such as HTML files and other content, or performs other functions on behalf of the client, returns a response message to the client. The response contains completion status information about the request and may also contain requested content in its message body.

### HTTP verbs tell remote web servers how to act

I just mentioned that **get** and **post** are the most widely used HTTP verbs. This is true. Every time your search 
engine gives you a list of links, and you click on a link, your browser sends a **get** verb to the server that runs 
the link you just clicked on. And, every time you push `Send` in GMail, share a tweet, or set a new Facebook status, 
your browser sends the message / tweet / status using **post**.

But, there are other verbs in HTTP. We won't really need to worry about those others in this tutorial, 
and you won't really need to worry about them when using the VersionOne APIs, but for your reference here is an 
excerpt from Wikipedia:

> HTTP defines methods (sometimes referred to as verbs) to indicate the desired action to be performed on the identified resource. What this resource represents, whether pre-existing data or data that is generated dynamically, depends on the implementation of the server. Often, the resource corresponds to a file or the output of an executable residing on the server.

And, the verbs it lists:

> GET -- Requests a representation of the specified resource. Requests using GET should only retrieve data and should have no other effect. (This is also true of some other HTTP methods.) The W3C has published guidance principles on this distinction, saying, "Web application design should be informed by the above principles, but also by the relevant limitations."

> HEAD -- Asks for the response identical to the one that would correspond to a GET request, but without the response body. This is useful for retrieving meta-information written in response headers, without having to transport the entire content.

> POST -- Requests that the server accept the entity enclosed in the request as a new subordinate of the resource identified by the URI. The data POSTed might be, as examples, an annotation for existing resources; a message for a bulletin board, newsgroup, mailing list, or comment thread; a block of data that is the result of submitting a web form to a data-handling process; or an item to add to a database.

> PUT -- Requests that the enclosed entity be stored under the supplied URI. If the URI refers to an already existing resource, it is modified; if the URI does not point to an existing resource, then the server can create the resource with that URI.

> DELETE -- Deletes the specified resource.

> TRACE -- Echoes back the received request so that a client can see what (if any) changes or additions have been made by intermediate servers.

> OPTIONS -- Returns the HTTP methods that the server supports for specified URL. This can be used to check the functionality of a web server by requesting '*' instead of a specific resource.

> CONNECT -- Converts the request connection to a transparent TCP/IP tunnel, usually to facilitate SSL-encrypted communication (HTTPS) through an unencrypted HTTP proxy.

> PATCH -- Is used to apply partial modifications to a resource.

With this basic knowledge, we can now introduce the basic ideas behind REpresentational State Transfer (REST)

## A state of REST

REST stands for REpresentational State Transfer. It's a term coined by Roy Fielding in his Ph.D. dissertation. He used 
it to describe the architecture of the World Wide Web. You can read more about [REST on Wikipedia]
(http://en.wikipedia.org/wiki/Representational_state_transfer). 

TODO: complete...


You can follow along with this if you want by jumping over to [http://eval.versionone.net/platformtest/v1requestor/]
(http://eval.versionone.net/platformtest/v1requestor). Note that some of the items may look a little different if 
people have been playing around, but the basic workflow should work.

## Known issues
If you search for something that doesn't exist, it is blowing up right now :) Will fix soon! 
Stick with the script for now!

## Home

The home page has a simple search box where you, or your customer, can search for a Project by name. Type `system` 
and hit `Enter` to pull up the example 'System (All Projects)` project.

![Home](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-01-home-a.png)

## Search for a project

After typing `system` and hitting enter, it will return the project into the list:

![Search](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-02-search.png)

## Select project to pull up a new Request form

Click the item, and it will open up a new Request entry form:

![Select Project / New Request](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-03-new.png)

## Enter new Request details

Fill in some details, and select a `High` priority (if your request is awesome!)

![Save New Request](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-04-enter.png)

## Save new Request

Once, you've typed in the Request details, click the `Save` button on the bottom right. It should display a green 
success message at the top. You can keep modifying the details if you'd like to add in more info, 
or click `New` from the top to start a brand new Request.

![Home](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-05-save.png)

## Select Request from list

Click the `List` button from the top left. This takes you back tot he list of Requests for the Project. Your new item 
should be there at the top of the list now. You can click on that to edit it, or just keep following along with the 
screen shots.

![Select Request](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-06-list.png)

## Modify and save Request

After picking a Request, and modifying its details, click the `Save` button. It should display a green success message.

***Note:*** if you empty out the `Request Title`, a required field, it will highlight the field and show a big bad 
red error message. Try it.

![Save Request](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-07-update.png)

## View Requests List in VersionOne

If you login to the test VersionOne instance, at [http://eval.versionone.net/platformtest]
(http://eval.versionone.net/platformtest) with username / password of `admin / admin`, then you can click the 
`Requests` tab and see the list, with your entry in it:

![View Requests List in VersionOne](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-08-v1list.png)

## View Request Detail in VersionOne

Click the item to popup the lightbox with details:

![View Request Detail in VersionOne](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-09-v1details.png)

## Edit Request in VersionOne

And, you can then click the `Edit` button on the right to edit and save your changes:

![View Request Detail in VersionOne](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part02/requestor-10-v1edit.png)



# TODO: Give conclusion and preview of the technical walkthrough
























This is an introduction to the **Developing Custom Apps with VersionOne APIs 101** tutorial series. It demonstrates how 
to create your own custom apps for VersionOne using standard HTML and open source JavaScript libraries that you 
already know and love. Starting with what you already know, or can easily learn, you'll tie into the
[VersionOne REST APIs] (http://community.versionone.com/sdk/documentation/coreapi.aspx) to build extensions and 
customizations to VersionOne that only you and your team can dream up!

By reading this series and performing the code exercises, you'll learn about new, simplified and 
improved JSON support in the API that augments the older XML format. This [JSON support is still experimental]
(https://github.com/versionone/VersionOne.SDK.Experimental), and we're seeking your input and feedback!


# TODO: NEED TO REVISIT EVERYTHING BELOW

Based on customer feedback, the first step we're taking is to add stronger support for simplified [JSON-based](http://en.wikipedia.org/wiki/JSON) 
HTTP requests and respones. We're also adding support for [YAML](http://en.wikipedia.org/wiki/YAML), 
an even cleaner and simpler data format than JSON (JSON is actually a subset of YAML). 

But, since JSON is the native format for JavaScript data, we'll focus on how it will make it easier to program
against the API than the default XML data format.

**In this how-to, you will:**

* Take a tour of a sample app built using the new JSON support, the VersionOne Requestor App
* Understand how the Requestor app leverages the main features of the VersionOne Data API
* Explore how the new, improved JSON support for the API powers the Requestor App
* Create a simpler version of the Requestor App using JSFiddle, and:
* Examine the HTTP requests and responses that our newly created app sends and receives to and from 
the VersionOne Data API

**What you'll need:**

Just Google Chrome. Most of this will work in other browsers, but you'll have to use their own developer tools.

## Test drive the VersionOne Requestor App

The VersionOne Requestor App is a simple, one page web app that serves one purpose: it lets users save and edit 
feature requests for a project within a VersionOne instance.

TODO: finish this section based on M, D feedback from 1/25

## Introduction to the VersionOne Data API's JSON Support

At the heart of the sample app we'll examine is [JSON](http://www.json.org/). 
VersionOne does not yet natively support the JSON format that we use in this app. 
But, the DLLs from the [VersionOne.SDK.Experimental repo](http://www.github.com/versionone/VersionOne.SDK.Experimental) 
add that support in an unobtrusive way in conjunction with a simple `Web.config` change. 
We'll also incorporate this support directly into the Core product 
for "out of the box" support in future releases. However, if you're interested in using this support on your 
own instance right now, then please contact us.

Before we look at any code, we'll click through some buttons in a sample V1 Requestor app and use 
Chrome's Developer Tools to examine the HTTP requests and responses.

## 1. Search for projects by name

* First, open Chrome, then open the Developer Tools by hitting `F12`, and select the Network tab
* Open [`http://eval.versionone.net/platformtest/v1requestor/index.html`](http://eval.versionone.net/platformtest/v1requestor/index.html)
* Type `system` into the text box
* Hit `Enter`

Now, in the Chrome Developer Tools' Network tab, we can inspect the HTTP request and HTTP response:

### HTTP Request generated

The URL created should look something like this:

#### URL

```
http://eval.versionone.net/platformtest/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name
```

Let's examine the URL in more detail. In order for the VersionOne Data API comprise this HTTP request:

* `sel=Name` *return only the `Name` attribute from the remote resource*
* `page=100,0` *return 100 items max, starting at page 0*
* `find='system'` *search for the word `system`*
* `findin=Name` *search for `find` parameter's value within the `Name` attribute only*

These parameters, taken together, tell the API what to do in order

#### Headers

A look at the full headers:

```text
GET /platformtest/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name HTTP/1.1
Host: eval.versionone.net
Connection: keep-alive
Authorization: Basic YWRtaW46YWRtaW4=
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11
Accept: */*
Referer: http://eval.versionone.net/platformtest/v1requestor/index.html
Accept-Encoding: gzip,deflate,sdch
Accept-Language: en-US,en;q=0.8
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3
```

### HTTP Response received

The response Content-Type header is `haljson`. [HAL is a proposed standard](http://stateless.co/hal_specification.html) 
for hypermedia documents. The format of the JSON returned in this sample aims to comply with HAL. 
Where you see `acceptFormat=haljson`, that's how the server knows we want the data returned in that format.

#### Headers

```text
HTTP/1.1 200 OK
Cache-Control: no-cache
Pragma: no-cache
Content-Length: 186
Content-Type: haljson; charset=utf-8
Expires: -1
Server: Microsoft-IIS/7.5
X-Powered-By: ASP.NET
Access-Control-Allow-Origin: *
Date: Mon, 14 Jan 2013 22:34:20 GMT
```

#### Body

```json
[
  {
    "Name": "System (All Projects)",
    "_links": {
      "self": {
        "href": "/VersionOne.Web/rest-1.v1/Data/Scope/0",
        "id": "Scope:0"
      }
    }
  }
]
```

## 2. Select a project and fetch its Requests assets

* Still with the Chrome Developer Tools and Network tab open, click the 'System (All Projeccts)` result
* Click the `List` button to fetch the Request list

### HTTP Request URL generated

```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request?acceptFormat=haljson&where=Scope%3D'Scope%3A0'&sel=Name%2CRequestedBy&page=75%2C0&sort=-ChangeDate
```

Again, various VersionOne Data API parameters comprise this URL:

* `where=Scope='Scope:0'` *return a Scope asset with the given id*
* `sel=Name,RequestedBy` *return the Name and RequestedBy attributes of this Scope asset*
* `page=75,0` *return 75 items max, starting at page 0*
* `sort=-ChangeDate` *sort the results in desending order by the ChangeDate attribute*

### HTTP Response received

The HTTP response contains an array of JSON objects that contain only the Name and RequestedBy attributes. This then gets used to populate the listview.

```json
[
  {
    "Name": "Date fields should look better",
    "RequestedBy": "Blaine Stussy",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1152",
        "id": "Request:1152"
      }
    }
  },
  {
    "Name": "As an API Adopter, I can deploy the Requestor Tool easily",
    "RequestedBy": "Ian Buchanan",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1151",
        "id": "Request:1151"
      }
    }
  },
  {
    "Name": "Add the Custom_Team custom field to the Request form",
    "RequestedBy": "Blaine Stussy",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1150",
        "id": "Request:1150"
      }
    }
  }
]
```

## 3. Select a Request to edit

* Now click the `Add the Custom_Team custom field to the Request form` request

### HTTP Request URL generated

```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request/1150?acceptFormat=haljson&sel=RequestedBy%2CName%2CDescription%2CPriority
```

The VersionOne API parameters breakdown:

* `/Data/Request/1150` *the specific URL that uniquely identifies this Scope asset*
* `sel=RequestedBy,Name,Description,Priority` *return just these four attributes*

### HTTP Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field to the Request form for the CapEx project, and only the CapEx project",
  "Priority.Name": "High",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150",
      "id": "Request:1150"
    },
    "Priority": [
      {
        "href": "/platformtest/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ]
  }
}
```

## 4. Modify the Request and save

* Change the `Description` field to specify some more detail. I changed it to:

```text
Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project
```

* Click the `Save` button

### HTTP Request generated

#### URL
```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request/1150?acceptFormat=haljson
```

This time, the URL is nothing but the address of the asset, plus the `acceptFormat` parameter to the backend service.

#### POST body

```json
{
    "RequestedBy": "Blaine Stussy",
    "Name": "Add the Custom_Team custom field to the Request form",
    "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
    "_links": {
        "Scope": {
            "idref": "Scope:0"
        },
        "Priority": {
            "idref": "RequestPriority:169"
        }
    }
}
```
**Note**: Because `Priority` is a Relation, there's no need to send the `Priority.Name`. Instead, it just sends a `_link` relation with the idref.

**Question:** for [RESTafarians](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) out there, what do you think about this: would be more RESTful to 
require sending the full address of the `href` param, that is `/platformtest/rest-1.v1/Data/RequestPriority/169`, 
instead of the shorter, non-address value from `idref`? See Roy Fielding's blog post 
[REST APIs must be hypertext-driven](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) 
for more background.

### HTTP Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. 
By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150/1321",
      "id": "Request:1150:1321"
    },
    "Scope": [
      {
        "href": "/platformtest/rest-1.v1/Data/Scope/0",
        "idref": "Scope:0"
      }
    ],
    "Priority": [
      {
        "href": "/platformtest/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ]
  }
}
```

Important in this HTTP response:

* It contains the same fields that we sent it, and only those fields
* The `_links.self.href` and `_links.self.id` properties contain the asset's `Moment`, which is a specific, very precise address of the asset. Since all asset changes are retained, this provides the exact location for this *version* of the asset. Note that if we now request the asset without the moment, the asset will still have the same state. However, someone else could change it before we do that. 
In that case, we can always request this specific moment of the asset's state by using the moment-containing URL or id.
* **NOTE**: I am not sure why it returned the Scope as a relation.

# Conclusion

I hope you found this useful as a gentle introduction to the VersionOne Data API using JSON! But, might
you be itching to start coding against the API yourself, using familiar open source JS libs like 
jQuery and Backbone.js? If so, then stay tuned for the next how-to example, which will show exactly that!

# Related Resources

Here are some links for code and also some reading that can help you understand REST better. 
Have some ideas for how the VersionOne API can be more RESTful and more useful to you? Let us know!

* [VersionOne.SDK.Experimental SDK repo](http://www.github.com/versionone/VersionOne.SDK.Experimental) - 
source code and instructions for adding this JSON support to your own on-premise VersionOne instance. 
(Contact us if you use hosted)
* [VersionOne Data API SDK Documentation](http://community.versionone.com/sdk/Documentation/DataAPI.aspx) -
detailed information and various examples of using the HTTP API in its native XML format
* [REST APIs must be hypertext-driven](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) - 
Roy Fielding's blog post about proper REST api design
* [HAL - Hypertext Application Language](http://stateless.co/hal_specification.html) - 
Mike Kelly's proposed standard a 'lean hypermedia type'
* [Stefan Tilkov on REST and Hypermedia, ROCA, WebSockets vs. HTTP](http://www.infoq.com/interviews/tilkov-rest-hypermedia) -
December 2012 interview about recent REST trends and related techniques from Goto conference
* [InfoQ Explores: REST](http://www.infoq.com/minibooks/emag-03-2010-rest) - 
Compiliation book of prominent articles from InfoQ
* [Building Web Services the REST Way](http://www.xfront.com/REST-Web-Services.html) - Roger Costello's 
excellent article on RESTful services
* [REST FEST conference and video archive](http://www.restfest.org/) - Mike Amundsen's REST FEST conference and 
video archive, with tons of great talks and information on RESTful design
* [Building Hypermedia APIs with HTML5 and Node](http://www.amazon.com/Building-Hypermedia-APIs-HTML5-Node/dp/1449306578) - 
Mike Amundsen's book on hypermedia design
* [REST Fundamentals Pluralsight Video Course](http://pluralsight.com/training/Courses/TableOfContents/rest-fundamentals) - 
Howard Dierking's excellent REST course on Pluralsight. Interestingly, it uses an agile tracking board as the domain. Don't 
go using his ideas to build a tool that's better than VersionOne, now, you hear?
