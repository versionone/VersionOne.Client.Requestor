define(function() {
var val = '<p>Welcome to {{title}}!\
	The current API adopters are:\
\
	<ul>\
	{{#each folks}}\
		<li>{{this}}</li>\
	{{/each}}\
	</ul>\
</p>';
console.log(val);
return val;
});