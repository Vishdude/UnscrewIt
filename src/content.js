
import Matter from "matter-js";
import MatterWrap from "matter-wrap";

//These bad boys revolve around the code
let domlist       = [];
let queue         = [];
let layers        = [];
let n             = 0;
let layernm       = 0;
let selectinglvl  = 0;
let unsdom        = [];
let mttrrunning   = 0;
let loadedmttr    = 0;
let phyDom        = [];
let mttrEls     = [];
let mvDomID;
let engine, runner, render, mvDomId;
let phbase;
function isBnd(DOMS,j){
	console.log("checking");
	let bounds = DOMS[j].getBoundingClientRect();
	for(let i = 0; i < DOMS.length; i++){
		let tarbound = DOMS[i].getBoundingClientRect();
		if (tarbound.x > bounds.x && tarbound.y > bounds.y && tarbound.x < bounds.x+bounds.width && tarbound.y < bounds.y+bounds.height){
			console.log(`(${tarbound.x},${tarbound.y}) is around (${bounds.x},${bounds.y})x(${bounds.x+bounds.width}, ${bounds.y+bounds.height})`);
			return true;
		}
	}
	return false;
}

function elPhy() {
  	let phyBase = document.createElement("div");
  	phyBase.style = "position:fixed; top:0; left:0; pointer-events:none; z-index: 99999999;";
  	unsdom.forEach((element) => {
    		let rect = element.getBoundingClientRect();
		let phyEl = element.cloneNode(true);
    		Object.assign(phyEl.style, {
      			position: "fixed",
      			margin: "0",
      			top: "0",
      			left: "0",
      			width: `${rect.width}px`,
      			height: `${rect.height}px`,
      			transformOrigin: "center center",

    		});
    		phyBase.appendChild(phyEl);
    		phyDom.push(phyEl);
  	});
	phbase = phyBase;
  	document.body.appendChild(phyBase);
}



//Matter.js stuffs
function crtmatter(DOMS){

	const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        World = Matter.World,
        Composite = Matter.Composite,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse;

    engine = Engine.create();
    const world = engine.world;
    runner = Runner.create();
    
    render = Render.create({
        element: document.querySelector("#mttrcvs"),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: "rgba(0,0,0,0)"
        }
    });

    Matter.use('matter-wrap');

    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth + 600, 60, { isStatic: true });
    Composite.add(world, [ground]);

    elPhy();

    for (let i = 0; i < DOMS.length; i++) {
        let bounds = DOMS[i].getBoundingClientRect();
        let dombox = Bodies.rectangle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width, bounds.height, {
            plugin: {
                wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: window.innerWidth, y: window.innerHeight }
                }
            },
            render: { fillStyle: 'transparent' }
        });
        mttrEls.push(dombox);
        Composite.add(world, [dombox]);
    }

    for (let i = 0; i < DOMS.length; i++) {
        DOMS[i].style.opacity = 0;
    }

    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

    World.add(world, mouseConstraint);
    render.mouse = mouse;
    
    Render.run(render);
    Runner.run(runner, engine);
    mttrrunning = 1;

    // Start sync loop
    mvDomID = requestAnimationFrame(mvDom);
}
function mvDom(){
	if (mttrrunning == 1){
		for(let i = 0; i < mttrEls.length;i++){
   			phyDom[i].style.transform = `translate(${mttrEls[i].position.x}px,${mttrEls[i].position.y}px) translate(-50%, -50%) rotate(${mttrEls[i].angle}rad)`;
			phyDom[i].style.transformOrigin = "center center";
    		}
    		mvDomID = requestAnimationFrame(mvDom);
	}
}

document.addEventListener("keydown", (event) => {
    if (event.key === 'Escape') {
        if (mttrrunning === 1) {
            cancelAnimationFrame(mvDomId);
            mttrrunning = 0;

            if (runner) Matter.Runner.stop(runner);
            if (render) {
                Matter.Render.stop(render);
                if (render.canvas) render.canvas.remove();
            }

            if (engine) {
                Matter.World.clear(engine.world);
                Matter.Engine.clear(engine);
            }

            document.querySelector("#mttrcvs")?.remove();
            document.querySelector("#phyBaseWrapper")?.remove();
            phbase.remove();
            unsdom.forEach(el => el.style.opacity = "");
            
            phyDom = [];
            mttrEls = [];
            console.log("Cleanup complete.");
        }
    }
});

function getelements(){
  domlist.push(document.body);
  queue.push(document.body);
  n = queue.length;
  while (queue.length != 0){
    while (n > 0){
      if(queue[0].children.length > 0){
        for (let i = 0; i < queue[0].children.length; i++){
            queue.push(queue[0].children[i]);
          }
        }
        domlist.push(queue[0]);
        queue.shift();
        n--;
      }
    layers.push(domlist);
    domlist = [];
    n = queue.length;
  }
}

function levelselector(){
	let elementcount= domlist.length;
	let middlelayer = (layers.length*0.5) | 0;

	//CREATING ELEMENTS
	let lcanvas     = document.createElement('canvas');
	let thing       = document.createElement('div');
	let sliderbase  = document.createElement('div');
	let slider      = document.createElement('input');
	let cancelbutt  = document.createElement('button');//heh heh cancel buttocks
	let unscbutt    = document.createElement('button');
	let mttrcvs	= document.createElement('div');
	let buttonarea	= document.createElement('div');
	let progressbar = document.createElement('progress');

	//CREATING ATTIBUTES
  let sltype      = document.createAttribute("type");
  let id          = document.createAttribute("id");
  let canheight   = document.createAttribute("height");
  let canwidth    = document.createAttribute("width");
  let attr        = document.createAttribute("style");
  let mttrpos	= document.createAttribute("style");
	let mttrid 	= document.createAttribute("id");
	let ubuttstyle	= document.createAttribute("style");
	let cbuttstyle	= document.createAttribute("style");
	let prgmax	= document.createAttribute("max");
	let prgval	= document.createAttribute("value");

	//Setting the resolution
 	canheight.value = window.innerHeight;
 	canwidth.value  = window.innerWidth;

 	//SET VALUES
 	sltype.value    = "range";
 	id.value        = "levelslider";
 	attr.value      = "position: fixed; right: 0px; bottom: 0px; background-color: white; z-index: 99999999; border-style: solid; border-radius: 10px; display: flex; flex-direction: row; padding: 5px; border-style: outset; padding: 10px;size: 200px;border-width: 10px; background: #ffffff; background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(212, 212, 212, 1) 100%);border-color: white;"
	mttrpos.value	= "position: fixed; z-index:999999999999999999999; top: 0px; left: 0px;";
	mttrid.value	= "mttrcvs";
	ubuttstyle.value	= "border-radius: 0px; ;background: #ffffff; background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(212, 212, 212, 1) 100%); color: black; border-style: outset; border-color: grey; border-size: 10px; width: 66px; height: 24px;font-size: 10px;"
	cbuttstyle.value	= ubuttstyle.value;


 	//SET ATTRIBUTE
 	lcanvas.setAttributeNode(canheight);
 	lcanvas.setAttributeNode(canwidth);
 	slider.setAttributeNode(sltype);
 	mttrcvs.setAttributeNode(mttrpos);
	mttrcvs.setAttributeNode(mttrid);
	thing.setAttributeNode(attr);
	cancelbutt.setAttributeNode(ubuttstyle);
	unscbutt.setAttributeNode(cbuttstyle);

  	//APPENDING DOM ELEMENTS
 	thing.appendChild(sliderbase);
 	cancelbutt.append("Cancel");
 	unscbutt.append("Unscrew");
 	sliderbase.appendChild(slider);
 	buttonarea.appendChild(unscbutt);
 	buttonarea.appendChild(cancelbutt);
 	sliderbase.appendChild(buttonarea);
	document.body.appendChild(thing);
	document.body.appendChild(lcanvas);
	document.body.appendChild(mttrcvs);

 	lcanvas.style = "position:fixed;top:0;left:0;z-index: 99999998;";
 	document.body.appendChild(lcanvas)
	console.log(layers);
 	let ctx = lcanvas.getContext("2d");
 	//ctx.fillRect(100,100,100,100);


 	slider.oninput = function(){
  		layernm = ((this.value*0.01)*layers.length) | 0;
  		ctx.clearRect(0, 0, lcanvas.width, lcanvas.height);
  		unsdom = [];
    		if(layers[layernm].length){
      			for(let i = 0; i < layers[layernm].length; i++){
        			bounds = layers[layernm][i].getBoundingClientRect();
        			if (!(bounds.height < 5 || bounds.width < 5 || bounds.x < 0 || bounds.y < 0 || bounds.top < 0 || bounds.bottom < 0 || bounds.right < 0 || bounds.left < 0 || bounds.top > window.innerHeight || bounds.left > window.innerWidth) && !isBnd(layers[layernm], i)){
          				ctx.strokeRect(bounds.x,bounds.y,bounds.width,bounds.height);
          				ctx.strokeStyle = "red";
        				unsdom.push(layers[layernm][i]);
        			}
      			}

    		}
  	}
  	cancelbutt.addEventListener("click", function(){
    		thing.remove();
    		lcanvas.remove();
    		selectinglvl = 0;
  	});

    unscbutt.addEventListener("click", function(){
      		selectinglvl = 0;   
   		thing.remove();
   		lcanvas.remove();
  		crtmatter(unsdom);
	  	layers = []
  	});

}


function main(){
	document.addEventListener("keydown",function(event){
    		if(selectinglvl === 0){
      			if(event.ctrlKey && event.altKey && event.key == 'u'){
          			console.log("iniziated")
          			getelements();
          			levelselector();
          			selectinglvl = 1;
  	    		}
    		}
  	});
//console.log(layers);
//console.log(domlist);
}

console.log("started");
main();
