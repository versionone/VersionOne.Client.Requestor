require.config({
	baseUrl: "https://raw.github.com/JogoShugh/AgileWordPointsGame/gh-pages/dynamic"
});

require(['jquery', 'v1json'], function($, v1) {
	window.v1 = v1;
	$.ajax("https://www7.v1host.com/V1Production/rest-1.v1/Data/Story/379909?accept=application/json&sel=Name,Description,Estimate").done(function(data) { window.asset = v1.jsonClean(data); });
});