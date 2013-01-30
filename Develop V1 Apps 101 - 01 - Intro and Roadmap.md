# Developing Custom Apps with VersionOne APIs 101: Introduction and Roadmap

This is an introduction to the **Developing Custom Apps with VersionOne APIs 101** tutorial series. It demonstrates how 
to create your own custom apps for VersionOne using standard HTML and open source JavaScript libraries that you 
already know and love. Starting with what you already know, or can easily learn, you'll tie into the
[VersionOne REST APIs] (http://community.versionone.com/sdk/documentation/coreapi.aspx) to build extensions and 
customizations to VersionOne that only you and your team can dream up!

By reading this series and performing the code exercises, you'll learn about new, simplified and 
improved JSON support in the API that augments the older XML format. This [JSON support is still experimental]
(https://github.com/versionone/VersionOne.SDK.Experimental), and we're seeking your input and feedback!

## Article links

TODO, fill this out with links to the others 

## Developing with you, not at you

This is also an introduction to our new development blog, and to our own goals of engaging in more 
collaboration with you, our users and being more responsive to your wants and needs for our products and APIs.

We want you, developers in organizations all around the world who use the VersionOne software, 
to be excited about programming with our APIs and platform. 

We realize that your job is not made easier by having to learn proprietary frameworks and APIs 
developed in an [ivory tower](http://www.lessonsoffailure.com/tag/ivory-tower/) and handed down to you by 
[*"architects who don't code"*](http://c2.com/cgi/wiki?ArchitectsDontCode) -- or even worse, by executects, 
marketects or salesitects.

Because of this, we want you to be ***involved and vocal about your wants and needs for a powerful API and 
platform***. If it looks like we have not read and understood the 
[FMGTABAA](http://www.lessonsoffailure.com/tag/ivory-tower/), then remind us that:

## Our goals for you are: Enjoyment, Skill Building, Achievement

We want you to:

### 1. Enjoy using the VersionOne APIs

We want you to *visibly* enjoy using the API. Yes, we want you to *enjoy* it. Not just tolerate it, or roll 
your eyes and grit your teeth because your boss thinks you need to use the API to intergrate with some old school 
monolithic one-size-fits-all tracking/reporting/source control "suite". 

***Repeat: we want you to enjoy writing code that consumes VersionOne APIs.***

Hey, what about that *visibly* part? Well, we plan to do some [hackathons](http://en.wikipedia.org/wiki/Hackathon), 
so we hope to see you there!

### 2. Master existing skills and build new ones for your future

You should feel like you're ***deepening the web development skills you already have***, or that you 
are picking up new ones that will also apply *elsewhere*, not just with the VersionOne APIs.

If at any time, you feel like we're producing APIs and tools that are borrowing vendor lock-in moves from the 
late 1990s, then yell at us, for our own good. This is **not the late 1990s**. We all work in a web that is 
increasingly linked, with services and sites sharing data in a ["Linked Data"]
(http://www.ted.com/talks/tim_berners_lee_on_the_next_web.html) kinda way. 

### 3. Achieve your own goals with ease

You have **your own products** to create. VersionOne cannot get in your way. It must make your lives ***easier***.

We know the web and all the devices connected to it keep changing and improving. We know you and your 
organizations want to move beyond the static web, beyond the dynamic web, and into the ["real-time web"]
(http://arstechnica.com/business/2012/05/say-hello-to-the-real-real-time-web/)!

It would be arrogant beyond belief for us to think that you don't have choices or that other companies aren't 
empowering you as we speak to do just that.

We prefer that you **choose willingly** to use VersionOne because of the enjoyment you feel about using it and our
APIs, the knowledge and skills you gain while developing with those APIs, and because, taken together, the 
whole package lets you and your organization build your own products more quickly and easily.

## You can also remind us about this

![Agile Manifesto](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/part01/agileManifesto.png)

You probably recognize that from [http://agilemanifesto.org/](http://agilemanifesto.org/).

It's likely that those words are what inspired you or your company to *take the plunge* and delve into agile in the 
first place. And, if it does not feel that way to you sometimes, maybe you can remind the company you work for of 
the phrase "Words mean things". VersionOne co-founder and CEO, Robert Holler, 
sent this [brief video](http://www.youtube.com/watch?feature=player_embedded&v=Hzgzim5m7oU&noredirect=1) 
out to our company last month to remind us all of that very idea.

Those words have *always meant something* to VersionOne -- one of the earliest companies to pursue the 
philosophy and practices wholeheartedly. These words continue to resonate with us today, even in a time when "agile" 
has become a platitudinous marketing buzzword that you **should be** right to be skeptical of whenever you hear it, 
including from us!

## Which article should I start with?

Since this is a progressive series, each article builds upon the previous, conceptually. Even though the code 
for each article stands alone, this can help you decide where to start:

### Beginners: readers without experience with HTML or JavaScript

If you don't yet have experience using HTML and JavaScript, but you'd like to complete this series either to learn 
more about programming against the VersionOne API, or just to figure out more about Web APIs and REST, try some of 
these:

* [P2PU Webmaking 101 Free Course](https://p2pu.org/en/schools/school-of-webcraft/sets/webmaking-101/) -- P2PU is a great way 
to learn with peers online. This multipart course will get you started in HTML, CSS, and JavaScript
* [WebPlatform.org Beginners Guide](http://docs.webplatform.org/wiki/beginners) -- open community with hands-on 
tutorials and standards documentation, backed by the web's biggest players
* [HTML 5 Rocks](http://www.html5rocks.com/en/) -- great site with more advanced and powerful demonstrations of 
HTML 5 features. Try [HTML5 Web Development To The Next Level](http://slides.html5rocks.com/#landing-slide), 
or more [HTML5 Demos](http://html5demos.com/)

### Novices: readers with basic HTML and JavaScript knowledge

If you have some experience making web pages with HTML and JavaScript, but are new to the concept of using APIs 
([Application Programming Interfaces](http://en.wikipedia.org/wiki/Application_programming_interface), 
or new to REST-based web APIs, ([REpresentational State Transfer]
(http://en.wikipedia.org/wiki/Representational_state_transfer)), then I recommend:

* [Ryan Tomayko's very brief REST introduction](http://tomayko.com/writings/rest-to-my-wife) -- what REST is all about. It can 
help you understand the concepts without needing to dive into code
* [Building Web Services the REST Way](http://www.xfront.com/REST-Web-Services.html) -- brief, but classic 
introduction to REST-based web services by Roger L. Costello
* [Programmable Web](http://www.programmableweb.com/) -- directory full of thousands of Web APIs available today

And, the other links in this paragraph or in the **Related Resources** section below may also help.

### Intermediate: experienced web developers comfortable with jQuery or other JavaScript libraries

You probably can just glance over this article and skip to the next article. It dives into creating a basic 
agile user story editor that can fetch data from and save data to the VersionOne Data API using only standard 
HTML and the open source [jQuery library](http://jquery.com/).

### Advanced: JavaScript ninjas

Have you already pre-ordered jQuery creator John Resig's book [Secrets of the JavaScript Ninja](http://jsninja.com/)?

Scarier still: have you already read it, despite him thinking he isn't even finished?!?$

Then, please open a new tab and head for [VersionOne Careers]
(http://tbe.taleo.net/CH07/ats/careers/jobSearch.jsp?org=VERSIONONE&cws=1)!

Anyway, you might want to go to part 3, which uses [Backbone.js Models](http://backbonejs.org/#Model) and 
[Backbone.sync](http://backbonejs.org/#Sync) to communicate with the VersionOne API. 
It also uses some more handy features from [Underscore.js](http://underscorejs.org/).

Still too basic? Are you already criticizing my example choice of Backbone.js already? Good. 

Maybe you can help our community refactor part 5 to be something you would feel proud of saying you 
helped build for the open source community. We'd love the help.
