require.config({
	baseUrl: "https://raw.github.com/JogoShugh/AgileWordPointsGame/gh-pages/dynamic"
});

require(['jquery', 'v1json'], function($, v1) {
	window.v1 = v1;
	$.ajax("http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1002?accept=application/json&sel=Name,Description,Estimate").done(function(data) { window.cleanData = v1.jsonClean(data); });
});