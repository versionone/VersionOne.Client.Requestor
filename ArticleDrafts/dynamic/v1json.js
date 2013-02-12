define(function(){
function jsonClean(original) {
    var obj = {
        "_links": {
            "self": {
                "href": original.href,
                "id": original.id
            }
        }
    }

    if (original._type == 'Asset') {
        for (var key in original.Attributes) {
            var item = original.Attributes[key];
            if (item._type == "Attribute") {
                obj[item.name] = item.value;
            } else if (item._type == "Relation") {
                if (item.value == null) {
                    obj._links[item.name] = [];
                } else {
                    obj._links[item.name] = [{
                        href: item.value.href,
                        idref: item.value.idref
                    }];
                }
            }
        }
    }
    return obj;
}

function json2xml(obj) {
	var doc = "<Asset>";
	for(var key in obj)
	{
		var item = obj[key];
		if (item == null) item = "";
		if (key == "_links") continue;
		var attr = '\t<Attribute name="' + key + '" act="set"><![CDATA[' + item + ']]></Attribute>\n';
		doc += attr;

	}
	for (var key in obj._links)
	{
		if (key == 'self') continue;
		var item = obj._links[key];
		var isArray = Object.prototype.toString.call(item) === '[object Array]';
		if (!isArray) {
			var rel = '\t<Relation name="' + key + '" idref="' + item.idref +
			'" act="set" />\n';
			doc += rel;
		}
	}
	doc += "</Asset>";
	return doc;
}

return {
	jsonClean: jsonClean,
	json2xml: json2xml
	
};
});