# See the VersionOne Data API with JSON Support in Action

The VersionOne team is hard at work trying to make it easier for you to program against 
our [Core API](http://community.versionone.com/sdk/documentation/coreapi.aspx). 

As part of that, we're adding stronger support for simplified [JSON](http://en.wikipedia.org/wiki/JSON) 
requests and respones. We're also adding support for [YAML](http://en.wikipedia.org/wiki/YAML), 
an even cleaner and simpler data format than JSON (JSON is actually a subset of YAML). 
But, since JSON is the native format for JavaScript data, we'll examine that here.

**In this how-to, you will:**

* Explore our VersionOne Data API's JSON support by using a sample app running on our public test instance
* Understand how to use API parameters to search for Project Assets (Scope Assets) and shape the output
* See how to format JSON requests for sending POST to the API to update Assets
* Learn some handy tools in Google Chrome for inspecting HTTP requests and responses

**What you'll need:**

Just Google Chrome. Most of this will work in other browsers, but you'll have to use their own developer tools.

## Introduction VersionOne Data API's JSON Support

At the heart of the sample app we'll examine is [JSON](http://www.json.org/). 
VersionOne does not yet natively support the JSON format that we use in this app. 
But, the DLLs from the [VersionOne.SDK.Experimental repo](http://www.github.com/versionone/VersionOne.SDK.Experimental) 
repo add that support in an unobtrusive way in conjunction with a simple `Web.config` change. 
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

#### URL

```
http://eval.versionone.net/platformtest/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name
```

Various VersionOne Data API parameters comprise this HTTP request:

* `sel=Name` *return only the `Name` attribute from the remote resource*
* `page=100,0` *return 100 items max, starting at page 0*
* `find='system'` *search for the word `system`*
* `findin=Name` *search for `find` parameter's value within the `Name` attribute only*

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
