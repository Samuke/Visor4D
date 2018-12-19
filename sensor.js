var origin = [450, 180],startAngle = Math.PI/6;
var svg2    = d3.select('.cubes');
var grupoSensor = svg2.append('g').attr('class', 'sensor');

var sensor3D = d3._3d()
	.shape('CUBE')
	.x(function(d){ return d.x; })
	.y(function(d){ return d.y; })
	.z(function(d){ return d.z; })
	.rotateY( startAngle)
	.rotateX(-startAngle)
	.origin(origin);
	//.scale(scale);//Escala del cubo

function processData2(data, tt){
	/* --------- CUBES ---------*/
	var cubes = cubesGroup.selectAll('g.cube').data(data, function(d){ return d.id });

	var ce = cubes
		.enter()
		.append('g')
		.attr('class', 'cube')
		.attr('fill', 'none')//relleno del cubo: ninguno
		.attr('stroke', d3.rgb(255,0,0) )//color de los bordes: rojo
		.merge(cubes);
		//.sort(sensor3D.sort);

	cubes.exit().remove();

	/* --------- FACES ---------*/
	var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'face')
		.attr('fill-opacity', 0.95)
		.attr('stroke-width', 1)
		.classed('_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', sensor3D.draw);

	faces.exit().remove();}

function init(id, posX, posY, posZ, radio){
	var cubesData = [];
	var _cube = makeCube(posX, posY, posZ, radio);
		_cube.id = 'sensor' + id;
		cubesData.push(_cube);
	processData2(sensor3D(cubesData), 1000);}

function makeCube(x, y, z, radio){
	return [
		{x: 0 - radio, y: y, z: 0 + radio}, // FRONT TOP LEFT
		{x: 0 - radio, y: 0, z: 0 + radio}, // FRONT BOTTOM LEFT
		
		{x: 0 + radio, y: 0, z: 0 + radio}, // FRONT BOTTOM RIGHT
		{x: 0 + radio, y: y, z: 0 + radio}, // FRONT TOP RIGHT
		
		{x: 0 - radio, y: y, z: 0 - radio}, // BACK  TOP LEFT
		{x: 0 - radio, y: 0, z: 0 - radio}, // BACK  BOTTOM LEFT
		
		{x: 0 + radio, y: 0, z: 0 - radio}, // BACK  BOTTOM RIGHT
		{x: 0 + radio, y: y, z: 0 - radio}, // BACK  TOP RIGHT
	];
}

d3.selectAll('button').on('click', init);
init(1, 10, 10, 10, 50);