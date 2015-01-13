
// ZIM js Interactive Media modules by Dan Zen http://danzen.com (c) 2014
// zimbuild.js adds common building functions for digidos (interactive media) http://zimjs.com
// free to use - donations welcome of course! http://zimjs.com/donate
// classes in this module require createjs namespace to exist and in particular easel.js
// available at http://createjs.com
// (borrows zim.ProportionDamp from zimcode)

if (typeof zog === "undefined") { // bootstrap zimwrap.js
	document.write('<script src="http://d309knd7es5f10.cloudfront.net/zimwrap_1.2.js"><\/script>');
	document.write('<script src="http://d309knd7es5f10.cloudfront.net/zimbuild_1.2.js"><\/script>');
} else {

var zim = function(zim) {
	
	if (zon) zog("ZIM BUILD Module");
	
	
	// Triangle class
	
	// extends a createjs.Shape
	// makes a triangle shape using three line lengths
	// var tri = new zim.Triangle(parameters);
	
	// PARAMETERS
	// a, b and c are the lengths of the sides
	// a will run horizontally along the bottom
	// b is upwards and c is back to the origin
	// fill, stroke, strokeSize are optional
	// center defaults to true and puts the registration point to the center
	// the actual center is not really the weighted center 
	// so can pass in an adjust which brings the center towards its vertical base
	
	zim.Triangle = function(a, b, c, fill, stroke, strokeSize, center, adjust) {
						
		function makeTriangle() {
		
			if (zot(a)) a = 100;
			if (zot(b)) b = a;
			if (zot(c)) c = a;
			if (zot(fill)) fill = "black";
			if (zot(center)) center = true;
			if (zot(adjust)) adjust = 0;
			
			var lines = [a,b,c];
			lines.sort(function(a, b){return b-a});
			aa = lines[0];
			bb = lines[1];
			cc = lines[2];
			
			if (aa > bb+cc) {
				zog("zimbuild.js Triangle(): invalid triangle lengths");
				return;
			}		
					
			var tri = new createjs.Shape();
			var g = tri.graphics;
			g.f(fill);
			if (!zot(stroke)) {
				g.s(stroke);
				if (zot(strokeSize)) strokeSize=1; 	
				g.ss(strokeSize);
			}
			g.mt(0,0);
			g.lt(a,0);
					
			
			// find biggest angle with cosine rule		
			var angle1 = Math.acos( (Math.pow(bb,2) + Math.pow(cc,2) - Math.pow(aa,2)) / (2 * bb * cc) ) * 180 / Math.PI;
			
			// use the sine rule for next biggest angle
			var angle2 = Math.asin( bb * Math.sin(angle1 * Math.PI / 180) / aa ) * 180 / Math.PI;
			
			// find last angle
			var angle3 = 180 - angle1 - angle2;
			
			// the next line is b the angle will be relative to the length of c
			// if c is the longest, then the angle is angle1
			// if c is the second longest, then the angle is angle2, etc.
			
			var nextAngle;
			if (c == aa) {nextAngle = angle1}
			else if (c == bb) {nextAngle = angle2}
			else {nextAngle = angle3}
					
			var backX = Math.cos(nextAngle * Math.PI / 180) * b;
			var upY = Math.sin(nextAngle * Math.PI / 180) * b;
			
			tri.width = Math.max(a, a-backX);
			tri.height = upY;
			tri.setBounds(0,0,tri.width,-tri.height);			
						
			g.lt(a-backX,0-upY);
			g.lt(0,0);
						
			if (center) {
				tri.regX = tri.width/2;
				tri.regY = -tri.height/2+adjust;
			}
			
			return tri;		
		}	
			
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time
		makeTriangle.prototype = new createjs.Shape();
		makeTriangle.constructor = zim.Triangle;
		return new makeTriangle();
		
	}	
	
	
	// Label Class
	
	// extends a createjs.Container	
	// makes a label - wraps the createjs Text object
	// can use with Button, CheckBox, RadioButtons and Pane 
	// var label = new zim.Label(parameters);	
	// Text seems to come in different sizes so we do our best
	// Have tended to find that left and alphabetic are most consistent across browsers
	
	// PARAMETERS
	// see the defaults in the code below 
	
	// METHODS
	// showRollColor(boolean) - true to show roll color (used internally)
	// clone() - returns a copy of the label and its properties
	// dispose() - to get rid of the button and listeners
	
	// PROPERTIES
	// label - references the text object of the label
	// text - references the text property of the text object
	
	// EVENTS
	// dispatches no events 
		
			
	zim.Label = function(labelText, fontSize, font, textColor, textRollColor, shadowColor, shadowBlur) {
	
		function makeLabel() {	
			
			if (zot(labelText)) labelText="LABEL";
			if (labelText == "") labelText = " ";
			if (zot(fontSize)) fontSize=36;
			if (zot(font)) font="arial";
			if (zot(textColor)) textColor="black";
			if (zot(textRollColor)) textRollColor=textColor;
			if (zot(shadowColor)) shadowColor=null;
			if (zot(shadowBlur)) shadowBlur=16;
		
			var that = this;
			this.mouseChildren = false;
			
			var obj = this.label = new createjs.Text(String(labelText), fontSize + "px " + font, textColor); 
			obj.textBaseline = "alphabetic";
			obj.textAlign = "left";			 
			if (shadowColor && shadowBlur > 0) obj.shadow = new createjs.Shadow(shadowColor, 3, 3, shadowBlur);
			this.addChild(obj);

			var backing = new createjs.Shape();
			backing.graphics.f("rgba(0,255,255,.01)").r(0,0,this.getBounds().width,this.getBounds().height);
			this.addChildAt(backing,0);
			
			this.setBounds(0,0,this.getBounds().width,this.getBounds().height);
			
			//obj.x = obj.getBounds().width / 2; 
			obj.y = fontSize-fontSize/6; //obj.getBounds().height / 2;
				
			Object.defineProperty(that, 'text', {
				get: function() {
					var t = (obj.text == " ") ? "" : obj.text;				
					return t;
				},
				set: function(value) {
					obj.text = value;
				}
			});
			
			this.showRollColor = function(yes) {
				if (zot(yes)) yes = true;
				if (yes) {
					obj.color = textRollColor;
				} else {
					obj.color = textColor;
				}
				if (that.getStage()) that.getStage().update();
			}
				
			this.on("mouseover", function(e) {that.showRollColor();});
			this.on("mouseout", function(e) {that.showRollColor(false);});
			
			this.clone = function() {
				return new zim.Label(that.text, fontSize, font, textColor, textRollColor, shadowColor, shadowBlur);	
			}
		
			this.dispose = function() {
				that.removeAllEventListeners();
			}
		}
	
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time
		makeLabel.prototype = new createjs.Container();
		makeLabel.constructor = zim.Label;
		return new makeLabel();
		
	}
		
		
	
	
	// Button Class
	
	// extends a createjs.Container	
	// makes a button with rollovers 
	// var button = new zim.Button(parameters);
	// you will need to stage.addChild(button); and position it
	// you will need to add a click event button.on("click", function);
	// the Button class handles the rollovers		
	
	// PARAMETERS
	// see the defaults in the code below
	// (label is a ZIM Label object or text for default label properties)
	
	// METHODS
	// dispose() - to get rid of the button and listeners
	
	// PROPERTIES
	// width and height - or use getBounds().width and getBounds().height
	// text - references the text property of the Label object of the button
	// label - gives access to the label including button.label.text
	// backing - references the backing of the button
	
	// EVENTS
	// dispatches no events - you make your own click event
		
			
	zim.Button = function(
		width, height, label, 
		backingColor, backingRollColor, borderColor, borderThickness,
		corner, shadowColor, shadowBlur
	) {
	
		function makeButton() {
			
			// if (zon) zog("zimbuild.js: Button");
			
			if (zot(width)) width=200;
			if (zot(height)) height=60;
			if (zot(backingColor)) backingColor="#C60";
			if (zot(backingRollColor)) backingRollColor="#F93";
			if (zot(borderColor)) borderColor=null;
			if (zot(borderThickness)) borderThickness=1;
			if (zot(corner)) corner=20;
			if (zot(shadowColor)) shadowColor="#666";
			if (zot(shadowBlur)) shadowBlur=16;			
			if (zot(label)) label = "PRESS";			
			if (typeof label === "string" || typeof label === "number") label = new zim.Label(label, 36, "arial", "white");			
						
			this.mouseChildren = false; 
			this.cursor = "pointer";
				
			var buttonBacking = new createjs.Shape();		
			var g = buttonBacking.graphics;		
			g.f(backingColor);
			if (borderColor) g.s(borderColor).ss(borderThickness);
			g.rr(0, 0, width, height, corner);
			this.addChild(buttonBacking);
			this.backing = buttonBacking;
								
			if (shadowBlur > 0) buttonBacking.shadow = new createjs.Shadow(shadowColor, 3, 3, shadowBlur);
			this.setBounds(0,0,width,height);
			this.width = width;
			this.height = height;
			
			label.x = (width-label.getBounds().width)/2+1;
			label.y = (height-label.getBounds().height)/2+2;
			this.addChild(label);
			this.label = label;		
			
			this.on("mouseover", buttonOn);
			var that = this;
			function buttonOn(e) {
				that.on("mouseout", buttonOff);
				var g = buttonBacking.graphics;
				g.clear();
				g.f(backingRollColor);
				if (borderColor) g.s(borderColor).ss(borderThickness);
				g.rr(0, 0, width, height, corner);
				that.label.showRollColor();
				if (that.getStage()) that.getStage().update();
			}
		
			function buttonOff(e) {
				that.off("mouseout", buttonOff); 
				var g =buttonBacking.graphics;
				g.clear();
				g.f(backingColor);
				if (borderColor) g.s(borderColor).ss(borderThickness);
				g.rr(0, 0, width, height, corner);
				that.label.showRollColor(false);
				if (that.getStage()) that.getStage().update();
			}			
			
			this.dispose = function() {
				that.removeAllEventListeners();
				that.removeChild(buttonBacking);
				that.removeChild(buttonLabel);
				buttonBacking = null;
				buttonLabel = null;
			}
		}
	
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time
		makeButton.prototype = new createjs.Container();
		makeButton.constructor = zim.Button;
		return new makeButton();
		
	}
	
	// CheckBox Class
	
	// extends createjs.Container
	// a checkbox that when clicked toggles the check and a checked property
	// var checkBox = new zim.CheckBox(parameters)
	
	// PARAMETERS
	// size - in pixels (always square)
	// label - ZIM Label object - or just some text to make a default label
	// startChecked - an initial parameter to set checked if true - default is false
	// color - the stroke and check color (default black) - background is set to a .5 alpha white
	// margin - is on outside of box so clicking or pressing is easier
	
	// METHODS
	// setChecked(Boolean) - defaults to true to set button checked (or use checked property)
	
	// PROPERTIES
	// label - gives access to the label including checkBox.label.text
	// checked - gets or sets the check of the box
	
	// EVENTS
	// dispatches a "change" event when clicked on (or use a click event)
	
	
	zim.CheckBox = function(size, label, startChecked, color, margin) {
	
		function makeCheckBox() {
			
			// if (zon) zog("zimbuild.js: CheckBox");
				
			if (zot(size)) size = 60;
			if (zot(label)) label = null;			
			if (typeof label === "string" || typeof label === "number") label = new zim.Label(label, size*5/6, "arial", color);
			var myChecked = (zot(startChecked)) ? false : startChecked;
			if (zot(color)) color = "black";
			if (zot(margin)) margin = 10; //20;			
			this.setBounds(-margin, -margin, size+margin*2, size+margin*2);	
					
			var that = this;
			this.cursor = "pointer";
			
			var box = new createjs.Shape();
			var g = box.graphics;
			g.f("rgba(0,0,0,.01)").r(
				this.getBounds().x,
				this.getBounds().y,
				this.getBounds().width,
				this.getBounds().height
			);
			g.f("rgba(255,255,255,.5)").r(0,0,size,size);						
			g.s(color).ss(size/10).r(size/7, size/7, size-size/7*2, size-size/7*2);
						
			this.addChild(box);			
			
			if (label) {
				this.addChild(label);
				label.x = this.getBounds().width;
				label.y = size/8; 
				this.label = label;
			}
				
			var check = new createjs.Shape();
			var g2 = check.graphics;		
			g2.f(color).p("AnQAdICBiaIEEDZIF8nfICfB4In/KPg"); // width about 90 reg in middle
						
			var cW = 95
			check.setBounds(-cW/2, -cW/2, cW, cW);			
			var scale = size/(cW+66);		
			
			check.scaleX = check.scaleY = scale;
			check.x = size/2;
			check.y = size/2;
			
			if (myChecked) this.addChild(check);					
			
			this.on("click", toggleCheck);
			
			Object.defineProperty(that, 'checked', {
				get: function() {				
					return myChecked;
				},
				set: function(value) {					
					that.setChecked(value);
				}
			});
			
			function toggleCheck(e) {			
				myChecked = !myChecked;
				that.setChecked(myChecked);
				that.dispatchEvent("change");
			}
			
			this.setChecked = function(value) {
				if (zot(value)) value = true;
				myChecked = value;
				if (myChecked) {
					that.addChild(check);
				} else {
					that.removeChild(check);
				}
				if (that.getStage()) that.getStage().update();
			}
			
			this.dispose = function() {
				that.removeAllEventListeners();				
			}
		}
	
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time
		makeCheckBox.prototype = new createjs.Container();
		makeCheckBox.constructor = zim.CheckBox;
		return new makeCheckBox();
		
	}	

	
	// RadioButtons Class
	
	// extends createjs.Container
	// a radio button set that lets you pick from choices
	// var radioButton = new zim.RadioButton(parameters)
	
	// PARAMETERS
	// size - in pixels (always square)
	// buttonData - an array of button data objects as follows:	
	// [{label:ZIM Label or text, id:optional id, selected:optional Boolean}, {etc...}]
	// or just a list of labels for default labels ["hi", "bye", "what!"]
	
	// vertical - boolean that if true displays radio buttons vertically else horizontally
	// color - the stroke and check color (default black) - background is set to a .5 alpha white
	// spacing - the space between radio button objects
	// margin - the space around the radio button itself
	
	// METHODS
	// setSelected(num) - sets the selected index (or use selectedIndex) -1 is default (none)
	
	// PROPERTIES
	// selected - gets the selected object - selected.label, selected.id, etc.
	// selectedIndex - gets or sets the selected index of the buttons
	// label - current selected label object
	// text - current selected label text
	// id - current selected id
	// labels - an array of the ZIM Label objects. labels[0].text = "YUM"; labels[2].y -= 10;
	
	// EVENTS
	// dispatches a "change" event when clicked on (or use a click event)
	// then ask for the properties above for info

	
	zim.RadioButtons = function(size, buttonData, vertical, color, spacing, margin) {
	
		function makeRadioButtons() {
			
			// if (zon) zog("zimbuild.js: RadioButtons");
			
			if (zot(size)) size = 60;
			if (zot(buttonData)) return;
			if (zot(vertical)) vertical = true;
			if (zot(color)) color = "black";
			if (zot(spacing)) spacing = (vertical) ? size*.2 : size;
			if (zot(margin)) margin =  size/5;			
			
			var that = this;
			this.cursor = "pointer";
			this.labels = [];
			var currentObject; // reference to the current data object
			
			var buttons = this.buttons = new createjs.Container();
			this.addChild(buttons);
			buttons.on("click", pressBut);
			function pressBut(e) {
				that.setSelected(buttons.getChildIndex(e.target));				
				that.dispatchEvent("change");
			}	
			
			
			// loop through data and call makeButton() each time
			makeButtons();
			var lastBut;
			function makeButtons() {
				// test for duplicate selected true properties (leave last selected)
				var data; var selectedCheck = false;
				for (var i=buttonData.length-1; i>=0; i--) {
					data = buttonData[i];
					if (data.selected && data.selected === true) {
						if (!selectedCheck) {
							selectedCheck = true; // first item marked selected
						} else {
							data.selected = "false"; // turn off selected
						}
					}					
				}				
				buttons.removeAllChildren();
				var but; var currentLocation = 0;
				for (var i=0; i<buttonData.length; i++) {
					data = buttonData[i];
					
					if (typeof data === "string" || typeof data === "number") {						
						var d = {selected:false, label:new zim.Label(data, size*5/6, "arial", color)};
						data = d;	
					}	
					if (data.label && typeof data.label === "string" || typeof data.label === "number") {
						data.label = new zim.Label(data.label, size*5/6, "arial", color);
					}
					that.labels.push(data.label);
					data.index = i;										
					but = makeButton(data.selected, data.label);					
					but.obj = data;	
					if (data.selected) currentObject = but.obj;
								
					buttons.addChild(but);
		
					if (vertical) {											
						but.y = currentLocation;
						currentLocation += but.getBounds().height + spacing;
					} else {
						but.x = currentLocation;
						currentLocation += but.getBounds().width + spacing;
					}
				}				
			}					
			
			// making a single button - similar to CheckBox class
			function makeButton(mySelected, label) {			
				var but = new createjs.Container();
				but.mouseChildren = false;
				but.setBounds(-margin, -margin, size+margin*2, size+margin*2);	
									
				var box = new createjs.Shape();
				var g = box.graphics;
				g.f("rgba(0,0,0,.01)").r(
					but.getBounds().x,
					but.getBounds().y,
					but.getBounds().width,
					but.getBounds().height
				);
				g.f("rgba(255,255,255,.5)").dc(size/2,size/2,size/1.85);						
				g.s(color).ss(size/9).dc(size/2, size/2, size/2-size/2/5);
				but.addChild(box);
					
				var check = but.check = new createjs.Shape();
				check.mouseEnabled = false;
				check.alpha = .95;
				var g2 = check.graphics;		
				g2.f(color).dc(size/2,size/2,size/5.2);	
				
				if (label) {
					but.addChild(label);
					label.x = but.getBounds().width;
					label.y = size/8; 
					that.label = label;
					but.setBounds(-margin, -margin, size+margin*2+label.getBounds().width, Math.max(size+margin*2, label.getBounds().height));
				}
				if (mySelected) but.addChild(check);
								
				return(but);
			}
			
			this.setBounds(0,0,this.getBounds().width+margin,this.getBounds().height+margin);
			
			// the main function that sets a button selected (after the initial makeButton)
			// this gets called by the setter methods below and the click event up top
			this.setSelected = function(value) {
				
				if (zot(value)) value = -1;
				if (value != -1 && !buttons.getChildAt(value)) return;
				
				var but;
				for (var i=0; i<buttons.getNumChildren(); i++) {
					but = buttons.getChildAt(i);					
					but.removeChild(but.check);
				}	
				if (value >= 0) {
					but = buttons.getChildAt(value);
					var lastIndex = -2;
					if (currentObject) lastIndex = currentObject.index;				
					currentObject = but.obj;
				}
				if (value == -1 || lastIndex == currentObject.index) {
					currentObject = null;
					that.id = null;
					that.label = null;
					that.text = "";
				} else {
					but.addChild(but.check);
					that.id = currentObject.id;
					that.label = currentObject.label;				
					if (that.label) that.text = that.label.text;
				}
				if (that.getStage()) that.getStage().update();
				
				function makeNull() {
					
				}
				
			}
			
			// getter setter methods
			
			Object.defineProperty(that, 'selected', {
				get: function() {				
					return currentObject;
				},
				set: function(value) {
					selectedIndex = value; // just in case
				}
			});
			
			Object.defineProperty(that, 'selectedIndex', {
				get: function() {			
					return (currentObject) ? currentObject.index : -1;
				},
				set: function(value) {
					this.setSelected(value); // just in case
				}
			});
			
			this.dispose = function() {
				that.removeAllEventListeners();				
			}
		}
	
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time
		makeRadioButtons.prototype = new createjs.Container();
		makeRadioButtons.constructor = zim.RadioButtons;
		return new makeRadioButtons();
		
	}
	
	

	
	// Pane Class
	
	// extends a createjs.Container
	// adds a window for alerts, etc.
	// var pane = new zim.Pane(parameters); 
	// you need to call the pane.show() to show the pane and pane.hide() to hide it
	// you do not need to add it to the stage - it adds itself centered
	// you can change the x and y (with origin and registration point in middle)

	// PARAMETERS
	// see the defaults in the code below
	// pass in the stage and the width and height of the pane
	// pass in an optional ZIM Label (or text for default label properties)
	// pass in a boolean for if you want to drag the pane (default false)
	// pass in whether a dragging pane should open at first start position (defaults false)
	// for reset, by default, Pane takes the first position and will continue to use that
	// modal defaults to true and means the pane will close when user clicks off the pane
	// corner is the corner radius default 20
	// the backingAlpha is the darkness of the background that fills the stage
	// value for shadow blur - 0 for no shadow
	
	// METHODS
	// show() - shows the pane
	// hide() - hides the pane
	
	// PROPERTIES
	// display - reference to the pane box
	// label - gives access to the label including pane.label.text
	// backing - reference to the backing	that covers the stage
	// resetX - if reset is true you can dynamically adjust the position if needed
	// resetY 
	
	// EVENTS
	// dispatches a "close" event when closed by clicking on backing
		
	zim.Pane = function(stage, width, height, label, color, drag, resets, modal, corner, backingAlpha, shadowColor, shadowBlur) {
		
		function makePane() {
			
			// if (zon) zog("zimbuild.js: Pane");
			
			if (zot(stage)) {zog("zimbuild.js Pane(): Please pass in a reference to the stage with bounds set as first parameter");	return;}
			if (!stage.getBounds()) {zog("zimbuild.js Pane(): Please give the stage bounds using setBounds()");	return;}

			if (zot(width)) width=200;
			if (zot(height)) height=200;
			if (zot(label)) label = null;			
			if (typeof label === "string" || typeof label === "number") label = new zim.Label(label, 40, "arial", "black");
			if (zot(color)) color="white";
			if (zot(drag)) drag=false;
			if (zot(resets)) resets=false;
			if (zot(modal)) modal=true;
			if (zot(corner)) corner=20;
			if (zot(backingAlpha)) backingAlpha=.14;
			if (zot(shadowColor)) shadowColor="#333";
			if (zot(shadowBlur)) shadowBlur=20;			
								
			var backing = this.backing = new createjs.Shape();				
			// make a big backing that closes the pane when clicked
			// could also provide a close button
			var g = backing.graphics;
			g.beginFill("black");
			g.drawRect(-5000,-5000,10000,10000);
			// makes it seem like the pane has the dimensions of the display
			this.setBounds(-width/2,-height/2, width, height);
			
			backing.alpha = backingAlpha; 			
			var that = this;
			backing.on("click", function(e) {
				that.hide();
				that.dispatchEvent("close");
				e.stopImmediatePropagation();
			});
			backing.on("mousedown", function(e) {
				e.stopImmediatePropagation();
			});
			if (modal) this.addChild(backing);
			
			var display = this.display = new createjs.Shape();
			display.setBounds(0, 0, width, height);
			display.regX = width/2;
			display.regY = height/2;
			g = display.graphics;
			g.beginFill(color);
			g.drawRoundRect(0, 0, width, height, corner);
			if (shadowBlur > 0) display.shadow = new createjs.Shadow(shadowColor, 8, 8, shadowBlur);		
			display.on("click", function(e) {
				// stops the click from going through the display to the background
				e.stopImmediatePropagation();
			});
			
			
			
			this.resetX; this.resetY;
			if (drag) {				
				display.cursor = "pointer";
				var diffX, diffY;	
				display.on("mousedown", function(e) {
					if (isNaN(that.resetX)) that.resetX = that.x;
					if (isNaN(that.resetY)) that.resetY = that.y;
					diffX = e.stageX - that.x;
					diffY = e.stageY - that.y;
					display.cursor = "move";
				});
								
				display.on("pressmove", function(e) {					
					var p = checkBounds(e.stageX-diffX, e.stageY-diffY); 
					that.x = p.x;
					that.y = p.y;
					stage.update();
				});
				
				this.on("pressup", function(e) {				
					display.cursor = "pointer";
				});
			}
			
			this.addChild(display);
			
			if (label) {
				label.x = -label.getBounds().width/2;
				label.y = -label.getBounds().height/2;
				this.addChild(label);				
				this.label = label;
				this.text = label.text;				
			}
															
		
					
			stage.update();			
			
			this.hide = function() {
				stage.removeChild(that);			
				stage.update();	
				if (resets) {
					if (!isNaN(that.resetX)) that.x = that.resetX;					
					if (!isNaN(that.resetY)) that.y = that.resetY;
				}
			}			
			this.show = function() {
				that.x = (stage.getBounds().width) /2;
				that.y = (stage.getBounds().height) /2;
				stage.addChild(that);			
				stage.update();	
			}			
			function checkBounds(x,y) {		
				x = Math.max(width/2, Math.min(stage.getBounds().width-width/2, x));
				y = Math.max(height/2, Math.min(stage.getBounds().height-height/2, y));
				return {x:x,y:y}				
			}			
			
			this.dispose = function() {
				display.removeAllEventListeners();
				that.removeChild(display);
				display = null;
			}
		}
		
		// note the actual class is wrapped in a function
		// because createjs might not have existed at load time		
		makePane.prototype = new createjs.Container();
		makePane.constructor = zim.Pane;
		return new makePane();
		
	}
	
	// ProportionDamp Class (borrowed from zimcode)
	
	// converts an input value to an output value on a different scale with damping	
	// works like Proportion Class but with a damping parameter
	// var pd = new zim.ProportionDamp(parmeters);
	
	// PARAMETERS
	// put in desired damping with 1 being no damping and .1 being the default
	// in your own interval or ticker event function call pd.convert(input)
	// the object always starts by assuming baseMin as baseValue
	// if you want to start or go to an immediate value without easing then
	// call the pd.immediate(baseValue) method with your desired baseValue (not targetValue)	
	
	// METHODS
	// convert(input) - converts a base value to a target value
	// immediate(input) - immediately sets the target value (no damping)
	
	// PROPERTIES
	// damp - can adjust this dynamically (usually just pass it in as a parameter to start)
			


	zim.ProportionDamp = function(baseMin, baseMax, targetMin, targetMax, damp, factor, targetRound) {
		
		if (zon) zog("zimbuild.js: ProportionDamp");
		
		// damp - can be changed via damp get/set method property	
		// factor - set to 1 for increasing and -1 for decreasing
		// round - true to round results to whole number 
		// zot() is found in danzen.js (the z version of not)		
		if (zot(targetMin)) targetMin = 0;
		if (zot(targetMax)) targetMax = 1;
		if (zot(damp)) damp = .1;
		if (zot(factor)) factor = 1;
		if (zot(targetRound)) targetRound = false;

		this.damp = damp; // want to expose as a property we can change
		var that = this;		
							
		// proportion
		var baseAmount;
		var proportion;
		var targetDifference;	
		var targetAmount;	
		
		// damping			
		var differenceAmount;
		var desiredAmount=0;
		var lastAmount = 0;
					
		baseAmount = baseMin; // just start at the min otherwise call immediate(baseValue);
		lastAmount = targetMin;					
		
		var interval = setInterval(calculate, 20);		
				
		function calculate() {	
			if (isNaN(baseAmount)) {return;}
							
			baseAmount = Math.max(baseAmount, baseMin);
			baseAmount = Math.min(baseAmount, baseMax);
			
			proportion = (baseAmount - baseMin) / (baseMax - baseMin);			
			targetDifference = targetMax - targetMin;	
			
			if (factor > 0) {					
				targetAmount = targetMin + targetDifference * proportion;						
			} else {
				targetAmount = targetMax - targetDifference * proportion;
			}				
			
			desiredAmount = targetAmount;			
			differenceAmount = desiredAmount - lastAmount;									
			lastAmount += differenceAmount*that.damp;						
			if (targetRound) {lastAmount = Math.round(lastAmount);}					
		}		
		
		this.immediate = function(n) {
			this.convert(n);
			calculate();
			lastAmount = targetAmount;
			if (targetRound) {lastAmount = Math.round(lastAmount);}	
		}
		
		this.convert = function(n) {
			baseAmount = n;			
			return lastAmount;
		}
		
		this.dispose = function() {
			clearInterval(interval);
		}
	}	
	
	
	// Parallax Class	
	
	// takes objects and moves them with a parallax effect based on mouse movement
	// for proper parallax, the objects closer move more than the objects farther back
	// make a new object: p = new zim.Parallax(parameters)
	
	// PARAMETERS
	// pass in the stage from your code (uses stage.mouseX and stage.mouseY)
	// pass in the damping value (.1 default)
	// pass in an array of layer objects in the following format
	// [[obj, distanceX, distanceY], [obj2, distanceX, distanceY], etc.]
	// or you can add these one at a time with the p.addLayer(obj, distanceX, distanceY); method
	// you must pass in a layer object - the distanceX and distanceY can be 0 for no motion on that axis
	// the distance is the total distance you want the layer object to travel
	// relative to the cursor position between 0 and stage width or height
	// the Parallax class will apply half the distance on either side of the object's start point
	// should work through nested clips...
	
	// METHODS 
	// addLayer(obj, distanceX, distanceY) - to alternately add layers after the object is made
	// dispose() - removes listeners
	
	// PROPERTIES
	// damp - allows you to dynamically change the damping
	
		
	zim.Parallax = function(stage, damp, layers) {
						
		if (zon) zog("zimbuild.js: Parallax");
		
		if (zot(stage)) {zog("zimbuild.js: Parallax(): please pass in the stage with bounds as first parameter"); return;}
		if (!stage.getBounds()) {zog("zimbuild.js Pane(): Please give the stage bounds using setBounds()");	return;}

		var stageW = stage.getBounds().width;
		var stageH = stage.getBounds().height;
		
		var that = this;
		
		// public properties
		this.damp = (zot(damp)) ? .1 : damp;
		//this.x = (zot(damp)) ? stageW/2 : x;
		//this.y = (zot(damp)) ? stageH/2 : y;
		
		// public methods (do not get hoisted so define early)
		// addLayer works as a public method
		// and also is called from the object in case we add layers via the Parallax object parameters
		// the function prepares ProportionDamp objects for both x and y
		// and stores them on the layer object
		// and also stores the desired distances on the layer objects themselves
		// finally, the layer object is added to the myLayers private property
		// the timer then loops through these layers and handles things from there
		this.addLayer = function(obj, distanceX, distanceY) {
			if (zot(obj)) return;
			obj.zimX = zot(distanceX)?0:distanceX;
			obj.zimY = zot(distanceY)?0:distanceY;
			if (obj.zimX != 0) {
				obj.zimpX = new zim.ProportionDamp(0, stageW, 0, obj.zimX, that.damp);				
			}
			if (obj.zimY != 0) {
				obj.zimpY = new zim.ProportionDamp(0, stageH, 0, obj.zimY, that.damp);				
			}
			obj.zimsX = obj.x;
			obj.zimsY = obj.y;
			myLayers.push(obj);		
		}	
		
		this.dispose = function() {
			myLayers = null;
			createjs.Ticker.off("tick", ticker);
		}
		

		// private properties
		// here are any layers that come in from Parallax object parameters
		layers = (zot(layers)) ? [] : layers;			
		
		// we now are going to process these layers with the public addLayer method
		// this will add the processed layers to the private property, myLayers
		var myLayers = [];		
		for (var i=0; i<layers.length; i++) {			
			this.addLayer(layers[i][0], layers[i][1], layers[i][2]);
		}
						
		var ticker = createjs.Ticker.on("tick", animate);	
		createjs.Ticker.setFPS(60);

		// loop though our layers and apply the converted proportion damping
		function animate(e) {			
			var o; var newX; var newY; var point;
			for (var i=0; i<myLayers.length; i++) {
				o = myLayers[i];				
				point = o.parent.localToGlobal(o.zimsX, o.zimsY);
				newX = point.x;
				newY = point.y;
				if (o.zimX != 0) {	
					newX = newX - o.zimX/2 + o.zimpX.convert(stage.mouseX);
				}
				if (o.zimY != 0) {
					newY = newY - o.zimY/2 + o.zimpY.convert(stage.mouseY);					
				}	
				point = o.parent.globalToLocal(newX, newY);				
				o.x = point.x;
				o.y = point.y;
			}
			stage.update();
		}			
	}
	
	
	
	// Scroller Class
	
	// animates a backing either horizontally or vertically (not both)
	// make a new zim.Scroller(parameters) object 
	// the Scroller object will animate and swap the backgrounds when needed
	
	// PARAMETERS
	// pass in two backgrounds (that look the same - clone them)	
	// pass in the speed, direction and a boolean for horizontal (default true)
	// setting horizontal to false will animate vertically
	// you can adjust the speed and direction properties dynamically
	// you cannot adjust the backings and horizontal dynamically
	// to change your animation, dispose() of the Scroller object and make a new one
	// disposing just removes the ticker - you have to remove the backings
	// not sure what is causing a small gap to appear over time 
	// but if your background can overlap a little you can pass in a gapFix of 10 pixels etc.
	
	// METHODS
	// dispose() - get rid of the event listeners - you need to remove the backings 
	
	// PROPERTIES
	// speed - how fast the animation is going in pixels per frame (ticker set at 60)
	// direction - either left or right if horizontal or up or down if not horizontal
	// gapFix - if spacing occurs over time you can set the gapFix dynamically
	
	
	zim.Scroller = function(b1, b2, speed, direction, horizontal, gapFix) {
		
		if (zon) zog("zimbuild.js: Scroller");
		
		var that = this; // we keep animate protected but want to access public properties
		
		// here are the public properties that can be changed
		this.speed = (zot(speed)) ? 1 : speed;
		this.direction = (zot(direction)) ? 1 : direction;
		this.gapFix = (zot(gapFix)) ? 0 : gapFix;
		
		if (!b1.getBounds() || !b2.getBounds()) {
			zog("zimbuild.js: Scroller(): please setBounds() on backing objects");
			return;
		}	
		if (!b1.getStage()) {
			zog("zimbuild.js: Scroller(): please add backing objects to stage to start");
			return;
		}	
			
		var stageW;
		var stageH;
		
		if (horizontal) {
			b2.x = b1.getBounds().width;	
		} else {
			b2.y = b1.getBounds().height;
		}
						
		var ticker = createjs.Ticker.on("tick", animate);	
		createjs.Ticker.setFPS(60);
		function animate(e) {
			if (!b1.getStage()) return;
			if (!b1.getStage().getBounds()) {zog("zimbuild.js: Scroller(): please setBounds() on stage"); return;}
			if (!stageW) {
				stageW = b1.getStage().getBounds().width;
				stageH = b1.getStage().getBounds().height;
			}
			// pausing the ticker does not really pause the ticker (weird)
			if (that.speed == 0 || that.direction == 0) {return;}
			
			if (horizontal) {
				b1.x -= that.speed*that.direction;
				b2.x -= that.speed*that.direction;	
				
				if (that.direction * that.speed > 0) { 
					if (b2.x < 0 && b1.x < b2.x) {
						b1.x = b2.getBounds().width-that.gapFix;
					} else if (b1.x < 0 && b2.x < b1.x) {
						b2.x = b1.getBounds().width-that.gapFix;
					}			
				} else {
					if (b2.x > stageW && b2.x > b1.x) {
						b2.x = b1.x - b1.getBounds().width+that.gapFix;
					} else if (b1.x > stageW && b1.x > b2.x) {
						b1.x = b2.x - b2.getBounds().width+that.gapFix;
					}	
				}
			} else {
				b1.y -= that.speed*that.direction;
				b2.y -= that.speed*that.direction;	
				
				if (that.direction * that.speed > 0) { 
					if (b2.y < 0 && b1.y < b2.y) {
						b1.y = b2.getBounds().height-that.gapFix;
					} else if (b1.y < 0 && b2.y < b1.y) {
						b2.y = b1.getBounds().height-that.gapFix;
					}			
				} else {
					if (b2.y > stageH && b2.y > b1.y) {
						b2.y = b1.y - b1.getBounds().height+that.gapFix;
					} else if (b1.y > stageH && b1.y > b2.y) {
						b1.y = b2.y - b2.getBounds().height+that.gapFix;
					}	
				}
			}
			b1.getStage().update();
		}		
		
		this.dispose = function() {
			if (zon) zog("bye from Scroller");
			createjs.Ticker.off("tick", ticker);
		}
		
	}	
	
	
	return zim;
} (zim || {});
}