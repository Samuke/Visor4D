var origin = [450, 180], scale = 10, cubesData = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
var color  = d3.scaleOrdinal(d3.schemeCategory20);
var cubesGroup = svg.append('g').attr('class', 'cubes');
var mx, my, mouseX, mouseY;

var cubes3D = d3._3d()
	.shape('CUBE')
	.x(function(d){ return d.x; })
	.y(function(d){ return d.y; })
	.z(function(d){ return d.z; })
	.rotateY( startAngle)
	.rotateX(-startAngle)
	.origin(origin);
	//.scale(scale);//Escala del cubo

function processData(data, tt){
	/* --------- CUBES ---------*/
	var cubes = cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

	var ce = cubes
		.enter()
		.append('g')
		.attr('class', 'cube')
		.attr('fill', 'none')//relleno del cubo: ninguno
		.attr('stroke', d3.rgb(0,136,255) )//color de los bordes: azules
		.merge(cubes);
		//.sort(cubes3D.sort);

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

function init(alto, largo, ancho){
	cubesData = [];
	var cnt = 0;
	var _cube = makeCube(0, 0, alto, largo, ancho);
		_cube.id = 'cube_1';
		/*_cube.height = alto;
		_cube.width = largo;*/
		cubesData.push(_cube);
	processData(cubes3D(cubesData), 1000);}

function dragStart(){
	mx = d3.event.x;
	my = d3.event.y;}

function dragged(){
	mouseX = mouseX || 0;
	mouseY = mouseY || 0;
	beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
	alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
	processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);}

function dragEnd(){
	mouseX = d3.event.x - mx + mouseX;
	mouseY = d3.event.y - my + mouseY;}

function makeCube(x, z, alto, largo, ancho){
	la = largo/2;
	an = ancho/2;
	return [
		{x: 0 - la, y: alto, z: 0 + an}, // FRONT TOP LEFT
		{x: 0 - la, y: 0, z: 0 + an}, // FRONT BOTTOM LEFT
		
		{x: 0 + la, y: 0, z: 0 + an}, // FRONT BOTTOM RIGHT
		{x: 0 + la, y: alto, z: 0 + an}, // FRONT TOP RIGHT
		
		{x: 0 - la, y: alto, z: 0 - an}, // BACK  TOP LEFT
		{x: 0 - la, y: 0, z: 0 - an}, // BACK  BOTTOM LEFT
		
		{x: 0 + la, y: 0, z: 0 - an}, // BACK  BOTTOM RIGHT
		{x: 0 + la, y: alto, z: 0 - an}, // BACK  TOP RIGHT
	];
}

d3.selectAll('button').on('click', init);
init(320, 600, 250);