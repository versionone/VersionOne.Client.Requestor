define(function(){

function jsonClean(original) {
    function processAsset(asset) {   
        var obj = {
            "_links": {
                "self": {
                    "href": asset.href,
                    "id": asset.id
                }
            }
        };
        for (var key in asset.Attributes) {
            var item = asset.Attributes[key];
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
        return obj;
    }

    var results = [];

    if (original._type == 'Asset') {
        results.push(processAsset(original));
    }

    if (original._type == 'Assets') {
        for(var i = 0; i < original.Assets.length; i++) {
            var asset = original.Assets[i];
            results.push(processAsset(asset));
        }
    }

    if (results.length < 1) return results;
    if (original._type == 'Asset') return results[0];
    return results;
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
			var rel = '\t<Relation name="' + key + '" act="set">' +
                '<Asset idref="' + item.idref +'"/></Relation>';
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