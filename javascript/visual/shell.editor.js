function Editor(container, mediator){
	this.mediator = mediator;
	this.container_selector = container;
	this.container = $(container);
	this.container.html("\
		<div id='editorHeader' class='ui tiered menu'> \
          <div class='menu'> \
            <a class='active item' data-tab='annotate'>\
              <i class='lab icon'> </i>  Annotate\
            </a>\
            <a class='item' data-tab='save'>\
              <i class='save icon'> </i> Save\
            </a>\
            <a class='item' data-tab='manage'>\
	              <i class='content basic icon'> </i> Manage\
	            </a>\
             <div class='right menu'>\
				<a class='item nonebtn' >\
	              <i class='mail icon'> </i> Quick Test Button\
	            </a>\
			 </div>\
            \
          </div>\
          <div class='ui sub menu active tab' data-tab='annotate'>\
            <a class='item' data-action='annotate'>Annotate</a>\
            <a class='item' data-action='annotateSelection'>Annotate Selected</a>\
            <a class='item' data-action='loadLocalFile'><i class='icon hdd'> </i>Local File</a>\
             <div class='ui dropdown item'>\
                <i class='cloud download icon'> </i> <div class='text'>Remote File</div><i class='icon dropdown'> </i>\
                <div id='remoteFileList' class='menu'>\
                </div>\
              </div>\
          </div>\
          <div class='ui sub menu tab' data-tab='save'>\
          	<a class='item' data-action='saveResult' data-arg='json'>JSON</a>\
          	<a class='item' data-action='saveResult' data-arg='xml'>XML</a>\
          	<a class='item' data-action='saveResult' data-arg='yaml'>YAML</a>\
          </div>\
          <div class='ui sub menu tab' data-tab='manage'>\
          	<a class='item' data-action='manageEntities'>Entities</a>\
          	<a class='item' data-action='showToolkit'>Assets &amp; Tools</a>\
          	<a class='item' data-action='manageImages'>Images</a>\
          </div>\
        </div>\
        \
         <div id='editorBlock' class='ui dimmable'>\
             <div class='ui dimmer'>\
                <div id='editorBlockDimmerText' class='ui text loader'>Processing...</div>\
              </div>\
             <pre id='editorItem' contentEditable spellcheck='false' lang='en'> </pre>\
        </div>\
        ");
    
    this.header = $("#editorHeader");
	this.view = $("#editorItem");
	this.dimmer = $("#editorBlock");
	this.dimmer.dimmer({"closable":false, duration: { show : 10, hide : 510 }});
	$('#editorHeader .item').tab({ history: false });
	this.container.click($.proxy(this.localOnClickHandler, this));
	this.fileSelector = document.createElement('input');
	this.fileSelector.setAttribute('type', 'file');
	this.fileSelector.addEventListener('change', $.proxy(this.readFile, this), false);
	this.activeResult = null;
	
	this.mediator.subscribe("action", $.proxy(this.onMessageAction, this));
	this.mediator.subscribe("event", $.proxy(this.onMessageEvent, this));
	
}

Editor.prototype = {
	
	pack : function (screenHeight, heightPercentage) {
		var headerH = this.header.outerHeight(false);
		var container = Math.floor(screenHeight/100*heightPercentage);
		var usable = container-headerH;
		changecss(this.container_selector, "height", container+"px");
		changecss(this.container_selector, "max-height", container+"px");
		changecss("#editorBlock", "height", usable+"px");
		changecss("#editorBlock", "max-height", usable+"px");
	},
	
	localOnClickHandler : function(event){
		var target = $(event.target).is("i.icon") ? $(event.target).parent() : $(event.target);
    	var action = target.attr("data-action");
    	if(action != null || action != undefined){
    		var argument = target.attr("data-arg");
    		console.log("local handler",action, argument);
			switch(action){
				case "annotateSelection":
					stopPropagation(event);
				case "annotate":
					$("#editorBlockDimmerText").text("Processing...");
					//this.dimmer.dimmer("show");
				break;
				break;
				case "loadRemoteFile":
					$("#editorBlockDimmerText").text("Loading file: "+argument);
					this.setBussy(true);
				break;
				case "loadLocalFile":
					this.fileSelector.click();
					stopPropagation(event);
				break;
			}
		}else if(target.is("strong")){
			var entID = target.attr("data-entity");
			var tags = target.attr("data-tags");
			this.mediator.publish("action", "entitySelect", {"entityID":entID,"tags":tags});
			//this.mediator.publish("entity:action", "select", entID);
			stopPropagation(event);	
		}else{
			this.mediator.publish("action", "entityDeselect", {});
			stopPropagation(event);
		}

	},
	
	onMessageAction: function(action, argument){
		
	},
	onMessageEvent:function(event, argument){
		
	},
	
	setExampleFiles: function(files){
		var fl = $("#remoteFileList");
		fl.parent('div').dropdown('destroy');
		var data = "";
		for(file in files){
			data +="<a class='item' data-action='loadRemoteFile' data-arg='"+files[file]+"'>"+files[file]+"</a>";
		}
		fl.html(data);
		fl.parent('div').dropdown({debug:false, on: 'hover', duration:10, delay: {show: 50, hide: 10}});
	},
	
	setText:function(text){
		this.dimmer.dimmer("hide");
		this.view.html(text);
	},
	getText:function(){
		return this.view.text();	
		//return getPlainText(document.getElementById("editorItem"));
		
	},
	
	enableControl:function(){
		
	},
	
	disableControl:function(){
		
	},
	
	setBussy: function(action){
		if(action)
			this.dimmer.dimmer("show");
		else
			this.dimmer.dimmer("hide");
	},
	
	readFile:function(evt) {
       var files = evt.target.files;
       var file = files[0];           
       var reader = new FileReader();
       var self = this;
       reader.onload = function() {
        	self.view.html(this.result);            
       };
       reader.readAsText(file);
	},
	
	setActiveResult: function(result){
		this.activeResult = result;
	},
	
	visualiseResult: function(){
		var item_list = this.activeResult.items;
		var entity = this.activeResult["entities"];
		var t_start = 0;
		var t_stop = 0;
		var t_in = this.getText();
		var f = 0;
		var output = "";
		
		for(var i in item_list){
			var i_length = item_list[i].length;
			var groupID = item_list[i][0];
			var tags = item_list[i][1];
			if(groupID == "date" || groupID == "interval"){
				console.log(groupID);
				continue;
			}
			
			var i_start = item_list[i][2];
			var i_stop = item_list[i][3];
			var i_data = item_list[i][4];
			
			t_stop = i_start;
			output +="<span data-start='"+t_start+"'>"+t_in.substring(t_start, t_stop)+"</span>";
			//output +="<strong data-entity='"+groupID+"' data-tags='"+tags.join(" ")+"' class='"+entity[groupID].group+"'>"+i_data+"</strong>";
			output +="<strong data-entity='"+groupID+"' data-tags='"+tags.join(" ")+"' class='"+entity[groupID].group+"'>"+t_in.substring(i_start, i_stop)+"</strong>";
			t_start = i_stop;
		}
		output +="<span data-start='"+t_start+"'>"+t_in.substring(t_start)+"</span>";
		this.view.html(output);
		this.dimmer.dimmer("hide");
		
	},
};

Object.defineProperty(Editor.prototype, "constructor", {
	enumerable: false,
	value: Editor
});

function getInnerText(el) {
    var sel, range, innerText = "";
    if (typeof document.selection != "undefined" && typeof document.body.createTextRange != "undefined") {
        range = document.body.createTextRange();
        range.moveToElementText(el);
        innerText = range.text;
    } else if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        sel = window.getSelection();
        sel.selectAllChildren(el);
        innerText = "" + sel;
        sel.removeAllRanges();
    }
    return innerText;
}

function getPlainText(node){
var normalize = function(a){
		// clean up double line breaks and spaces
		if(!a) return "";
		return a.replace(/ +/g, " ")
				.replace(/[\t]+/gm, "")
				.replace(/[ ]+$/gm, "")
				.replace(/^[ ]+/gm, "")
				.replace(/\n+/g, "\n")
				.replace(/\n+$/, "")
				.replace(/^\n+/, "")
				.replace(/\nNEWLINE\n/g, "\n\n")
				.replace(/NEWLINE\n/g, "\n\n"); // IE
	}
	var removeWhiteSpace = function(node){
		// getting rid of empty text nodes
		var isWhite = function(node) {
			return !(/[^\t\n\r ]/.test(node.nodeValue));
		}
		var ws = [];
		var findWhite = function(node){
			for(var i=0; i<node.childNodes.length;i++){
				var n = node.childNodes[i];
				if (n.nodeType==3 && isWhite(n)){
					ws.push(n)
				}else if(n.hasChildNodes()){
					findWhite(n);
				}
			}
		}
		findWhite(node);
		for(var i=0;i<ws.length;i++){
			ws[i].parentNode.removeChild(ws[i])
		}

	}
	var sty = function(n, prop){
		// Get the style of the node.
		// Assumptions are made here based on tagName.
		if(n.style[prop]) return n.style[prop];
		var s = n.currentStyle || n.ownerDocument.defaultView.getComputedStyle(n, null);
		if(n.tagName == "SCRIPT") return "none";
		if(!s[prop]) return "LI,P,TR".indexOf(n.tagName) > -1 ? "block" : n.style[prop];
		if(s[prop] =="block" && n.tagName=="TD") return "feaux-inline";
		return s[prop];
	}

	var blockTypeNodes = "table-row,block,list-item";
	var isBlock = function(n){
		// diaply:block or something else
		var s = sty(n, "display") || "feaux-inline";
		if(blockTypeNodes.indexOf(s) > -1) return true;
		return false;
	}
	var recurse = function(n){
		// Loop through all the child nodes
		// and collect the text, noting whether
		// spaces or line breaks are needed.
		if(/pre/.test(sty(n, "whiteSpace"))) {
			t += n.innerHTML
				.replace(/\t/g, " ")
				.replace(/\n/g, " "); // to match IE
			return "";
		}
		var s = sty(n, "display");
		if(s == "none") return "";
		var gap = isBlock(n) ? "\n" : " ";
		t += gap;
		for(var i=0; i<n.childNodes.length;i++){
			var c = n.childNodes[i];
			if(c.nodeType == 3) t += c.nodeValue;
			if(c.childNodes.length) recurse(c);
		}
		t += gap;
		return t;
	}
	// Use a copy because stuff gets changed
	node = node.cloneNode(true);
	// Line breaks aren't picked up by textContent
	node.innerHTML = node.innerHTML.replace(/<br>/g, "\n");

	// Double line breaks after P tags are desired, but would get
	// stripped by the final RegExp. Using placeholder text.
	var paras = node.getElementsByTagName("p");
	for(var i=0; i<paras.length;i++){
		paras[i].innerHTML += "NEWLINE";
	}

	var t = "";
	removeWhiteSpace(node);
	// Make the call!
	return normalize(recurse(node));

}


