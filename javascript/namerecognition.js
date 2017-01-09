result = {};
id = 0;
inputText = "";

self = this;

$(document).ready(function(){
	$("#findBtn").click(findNames);
	$("#showHelp").click(function(){
		$("#helpModal").modal("show")
	});
	

	var pageWidth = window.innerWidth,
		pageHeight = window.innerHeight;
	if (typeof pageWidth != "number"){
		if (document.compatMode == "CSS1Compat"){
			pageWidth = document.documentElement.clientWidth;
			pageHeight = document.documentElement.clientHeight;
		} else {
			pageWidth = document.body.clientWidth;
			pageHeight = document.body.clientHeight;
		}
	}
	pageHeight -= $("#fixedHeader").outerHeight();
	//console.log(pageHeight, pageHeight-50);
	//pageHeight -= 50;
	
	changecss("#panelWrapper", "height", pageHeight+"px");
	changecss("#panelWrapper", "max-height", pageHeight+"px");
	changecss("#editor", "height", pageHeight+"px");
	changecss("#editor", "max-height", pageHeight+"px");

	$(".dimmer").dimmer({"closable":false, duration: { show : 10, hide : 510 }});
	
});

function getTypeClass(id){
	switch(id){
		case 0:
			return "type0"
		case 1:
			return "type1"
		case 2:
			return "type2"
		case 3:
			return "type3"
		case 7:
			return "type7"
		case 8:
			return "type8"
	}
}


function parseACResult(data){
	console.log(data);
	var item_list = data["result"]
	var output = "";
	var t_in = inputText;
	var t_start = 0;
	var t_stop = 0;

	for(var i in item_list){
		    var type = item_list[i][0];
		    var typeclass = getTypeClass(type);
			var i_start = item_list[i][1];
			var i_stop = item_list[i][2];
			var i_data = item_list[i][3];
			
			t_stop = i_start-1;
			output +="<span data-start='"+t_start+"'>"+t_in.substring(t_start, t_stop)+"</span>";
			//output +="<strong data-entity='"+groupID+"' data-tags='"+tags.join(" ")+"' class='"+entity[groupID].group+"'>"+i_data+"</strong>";
			output +="<strong class='"+typeclass+"'>"+t_in.substring(i_start-1, i_stop)+"</strong>";
			t_start = i_stop;
		}
		output +="<span data-start='"+t_start+"'>"+t_in.substring(t_start)+"</span>";
	$("#editor").html(output);
	$(".dimmer").dimmer('hide');
	return false;

}


function findNames(){
	
	console.log("find_names_fnc");
	var inputData = $("#editor").text();
	inputText = inputData;
	if(inputText == "")
		return;
	var jsonrpc = {"jsonrpc": "2.0", "method": "nameRecognition", "params": {"inputData":inputData}, "id": id++};
	console.log(jsonrpc);
	$.ajax({  
		type: "POST",  
		url: "/api/HTTP/jsonrpc",  
		data: JSON.stringify(jsonrpc),
		contentType: "application/json",
  		processData: false,
  		dataType: "json",
		success: parseACResult
		
		
	});
	$(".dimmer").dimmer('show');
	
}






String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(preffix) {
    return this.indexOf(preffix, 0) !== -1;
};

String.prototype.capitalize = function(type) {
 
	// if type = all, capitalize first letter of each word
	if(type === 'all'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';
 
		$.each(array, function( index, value ) {
			capitalized += value.charAt(0).toUpperCase() + value.slice(1);
 
			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}
 
	// if type = title, capitalize first letter of each word so long as it is not
	// an article, coordinate conjunction, preposition (etc) unless it is the first word
	// -> traditionally left uppercase if over 4 or 5 letters
	// -> I'm only doing the common ones, add more in the doNotCapitalize array
	if(type === 'title'){
		array		= this.split(' '); // split on spaces
		capitalized	= '';
		doNotCapitalize	= ["a", "an", "and", "as", "at", "but", "by", "etc", "for", "in", "into", "is", "nor", "of", "off", "on", "onto", "or", "so", "the", "to", "unto", "via"];
 
		$.each(array, function( index, value ) {
			// only capitalize if first word or not in doNotCapitalize array
			if( index === 0 || $.inArray(value, doNotCapitalize) === -1 ) // inArray returns -1 for false, 0 for element index in array
				capitalized += value.charAt(0).toUpperCase() + value.slice(1);
			else
				capitalized += value;
 
			if( array.length != (index+1) )
				capitalized += ' '; // add a space if not end of array
		});
		return capitalized;
	}
	
	// else just capitalize first letter of first word
	return this.charAt(0).toUpperCase() + this.slice(1);
};
 

