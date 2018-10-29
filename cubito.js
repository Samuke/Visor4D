var origin = [(screen.width)/2, (screen.height)/2-100], scale = 10, cubesData = [], sensorData = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
// var svg2   = d3.select('.vCubo').append('s');
var cubesGroup = svg.append('g').attr('class', 'cubes');
var sensorGroup = svg.append('g').attr('class', 'sensores');
var mx, my, mouseX, mouseY;

var cubes3D = d3._3d()
	.shape('CUBE')
	.x(function(d){ return d.x; })
	.y(function(d){ return d.y; })
	.z(function(d){ return d.z; })
	.rotateY( startAngle)
	.rotateX(-startAngle)
	.origin(origin);

function processData(data, tt){
	console.log("processData");
	/* --------- CUBES ---------*/
	var cubes = cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

	var ce = cubes
		.enter()
		.append('g')
		.attr('class', 'cube')
		.attr('fill', 'none')//relleno del cubo: ninguno
		.attr('stroke', d3.rgb(0,136,255) )//color de los bordes: azules
		.merge(cubes);

	cubes.exit().remove();

	/* --------- FACES ---------*/
	var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'face')
		.attr('fill-opacity', 0.95)
		.attr('stroke-width', 4)
		.classed('_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);

	faces.exit().remove();}

function dataCSensor(data, tt){
	console.log("dataCSensor");
	var cubos = sensorGroup.selectAll('g.sensor').data(data, function(d){ return d.id });

	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'sensor')
		.attr('fill', 'none')//relleno del cubo: ninguno
		.attr('stroke', d3.rgb(0,0,0) )//color de los bordes: rojo
		.merge(cubos);

	cubos.exit().remove();
	
	var faces = cubos.merge(cu).selectAll('path.cara').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'cara')
		.attr('fill-opacity', 0.5)
		.attr('stroke-width', 3)
		.classed('le_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);

	faces.exit().remove();
}

function init(alto, largo, ancho){
	console.log("init");
	cubesData = [];
	var _cube = makeCube(alto, largo, ancho);
		_cube.id = 'cube_1';
		cubesData.push(_cube);
	processData(cubes3D(cubesData), 1000);
}

function initSensor(id, posX, posY, posZ, radio){
	console.log("initSensor");
	sensorData = [];
	var _cubo = makeSensor(270, 0, -125, radio);
		_cubo.id = 'sensor' + id;
		_cubo.height = radio;
		_cubo.width = radio;
		sensorData.push(_cubo);
	dataCSensor(cubes3D(sensorData), 1000);}

function dragStart(){
	mx = d3.event.x;
	my = d3.event.y;}

function dragged(){
	mouseX = mouseX || 0;
	mouseY = mouseY || 0;
	beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
	alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
	processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);
	dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

function dragEnd(){
	mouseX = d3.event.x - mx + mouseX;
	mouseY = d3.event.y - my + mouseY;}

function makeCube(alto, largo, ancho){
	console.log("makeCube");
	al = alto/2;
	la = largo/2;
	an = ancho/2;
	return [
		{x: 0 - la, y: al, z: 0 + an}, // FRONT TOP LEFT
		{x: 0 - la, y: -al, z: 0 + an}, // FRONT BOTTOM LEFT
		
		{x: 0 + la, y: -al, z: 0 + an}, // FRONT BOTTOM RIGHT
		{x: 0 + la, y: al, z: 0 + an}, // FRONT TOP RIGHT
		
		{x: 0 - la, y: al, z: 0 - an}, // BACK  TOP LEFT
		{x: 0 - la, y: -al, z: 0 - an}, // BACK  BOTTOM LEFT
		
		{x: 0 + la, y: -al, z: 0 - an}, // BACK  BOTTOM RIGHT
		{x: 0 + la, y: al, z: 0 - an}, // BACK  TOP RIGHT
	];
}

function makeSensor(x, y, z, radio){
	console.log("makeSensor");
	r = 0;
	var regresa = [
		{x: x - radio, y: y + radio, z: z + 0}, // FRONT TOP LEFT
		{x: x - radio, y: y - radio, z: z + 0}, // FRONT BOTTOM LEFT
		
		{x: x + radio, y: y - radio, z: z + 0}, // FRONT BOTTOM RIGHT
		{x: x + radio, y: y + radio, z: z + 0}, // FRONT TOP RIGHT
		
		{x: x - radio, y: y + radio, z: z - 0}, // BACK  TOP LEFT
		{x: x - radio, y: y - radio, z: z - 0}, // BACK  BOTTOM LEFT
		
		{x: x + radio, y: y - radio, z: z - 0}, // BACK  BOTTOM RIGHT
		{x: x + radio, y: y + radio, z: z - 0}, // BACK  TOP RIGHT
	];
	console.log(regresa);
	return regresa;
}

init(320, 600, 250);
initSensor(1,48,50,120,30);
