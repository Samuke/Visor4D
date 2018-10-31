var sensorGroup = svg.append('g').attr('class', 'sensores');
//dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);//agrega esta línea a la funcion dragged()
function dataCSensor(data, tt){
	console.log("dataCSensor");
	var cubos = sensorGroup.selectAll('g.sensor').data(data, function(d){ return d.id });
	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'sensor')
		.attr('fill', 'none')//relleno del cubo: ninguno
		.attr('stroke', d3.rgb(255,0,0) )//color de los bordes: rojo
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
	faces.exit().remove();}
function initSensor(id, posX, posY, posZ, radio){
	sensorData = [];
	var _cubo = makeSensor(posX, posY, posZ, radio);
		_cubo.id = 'sensor' + id;
		_cubo.height = radio;
		_cubo.width = radio;
		sensorData.push(_cubo);
	dataCSensor(cubes3D(sensorData), 1000);}

function makeSensor(x, y, z, radio){
	return [
		{x: x - radio, y: y + radio, z: z + radio}, // FRONT TOP LEFT
		{x: x - radio, y: y - radio, z: z + radio}, // FRONT BOTTOM LEFT
		
		{x: x + radio, y: y - radio, z: z + radio}, // FRONT BOTTOM RIGHT
		{x: x + radio, y: y + radio, z: z + radio}, // FRONT TOP RIGHT
		
		{x: x - radio, y: y + radio, z: z - radio}, // BACK  TOP LEFT
		{x: x - radio, y: y - radio, z: z - radio}, // BACK  BOTTOM LEFT
		
		{x: x + radio, y: y - radio, z: z - radio}, // BACK  BOTTOM RIGHT
		{x: x + radio, y: y + radio, z: z - radio}, // BACK  TOP RIGHT
	];
}
initSensor(1,48,50,120,20);