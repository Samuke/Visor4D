var origin = [400, 300], scale = 10, cubesData = [], sensorData = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g')
// var svg2   = d3.select('.vCubo').append('s');
var cubesGroup = svg.append('g').attr('class', 'cubes');
var carasPrisma = svg.append('g').attr('class', 'caras');
var nodeSensor = svg.append('g').attr('class', 'caras');
var mx, my, mouseX, mouseY;
nPos = [250,320,600] // x,y,z

$('#nInfo').click(function () {
    var x = $("#nAncho").val();
    var y = $("#nAlto").val();
    var z = $("#nLargo").val();
    nPos=[x*30,y*30,z*30];
    initFaces(1,nPos[0],nPos[1],nPos[2]);
});


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
		.attr('stroke', d3.rgb(0,0,0) )//color de los bordes: negros
		.merge(cubes);

	cubes.exit().remove();

	/* --------- FACES ---------*/
	var faces = cubes.merge(ce).selectAll('path.face').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'face')
		.attr('fill-opacity', 0.1)
		.attr('stroke-width', 0)
		.classed('_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);

	faces.exit().remove();}

function dataFaces(data, tt){
	console.log("dataFaces");
	var cubos = carasPrisma.selectAll('g.caras').data(data, function(d){ return d.id });

	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'caras')
		.attr('fill', d3.rgb(127, 140, 141))//relleno del cubo: ninguno		.attr('stroke', d3.rgb(0,0,0) )//color de los bordes: rojo
		.attr('stroke', d3.rgb(0,0,0) )//color de los bordes: negros
		.merge(cubos);

	cubos.exit().remove();
	
	var faces = cubos.merge(cu).selectAll('path.cara').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'cara')
		.attr('fill-opacity', 0.12) // OPACIDAD CARAS DEL PRISMA 
		.attr('stroke-width', 0.1)
		.classed('le_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);
	 
}


function init(alto, largo, ancho){
	console.log("init");
	cubesData = [];
	var _cube = makeCube(alto, largo, ancho);
		_cube.id = 'cube_1';
		cubesData.push(_cube);
	processData(cubes3D(cubesData), 1000);
}

function initFaces(id, posX, posY, posZ){  // Creacion caras del prisma.
	console.log("initFaces");
	sensorData = [];                        
	for(var i = 0; i < 3; i++){ //FOR PARA CREAR LAS 3 CARAS NECESARIAS EN EL GRAFICO
		if(i == 0){ 			//ARREGLO nPos SON LAS DIMENSIONES EN PX DEL PRISMA, ESTA CREADA AL COMIENZO.
			nDraw = [posZ/2,0,posX/2]    //ARREGLO DONDE SE PASA DIMENSIONES X,Y,Z PARA UTILIZARLO EN makeFaces.
			var _cubo = makeFaces(0,posY/2, 0, nDraw); //CARA DE BASE.
				_cubo.id = 'cara' + 1;
				sensorData.push(_cubo);
		}
		if(i == 1){ 	
			nDraw = [0,posY/2,posX/2]   
			var _cubo = makeFaces(posZ/2,0, 0, nDraw); // CARA DERECHA.
				_cubo.id = 'cara' + 2;
				sensorData.push(_cubo);
		}
		if(i == 2){ 	
			nDraw = [posZ/2,posY/2,0]
			var _cubo = makeFaces(0,0,-posX/2, nDraw); //CARA FONDO.
				_cubo.id = 'cara' + 3;
				sensorData.push(_cubo);
		}
	}
	dataFaces(cubes3D(sensorData), 1000);
}

function dragStart(){
	mx = d3.event.x;
	my = d3.event.y;}

function dragged(){
	mouseX = mouseX || 0;
	mouseY = mouseY || 0;
	beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
	alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
	processData(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(cubesData), 0);
	dataFaces(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

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

function makeFaces(x, y, z, dPos){
	console.log("makeFaces");
	var regresa = [
		{x: x - dPos[0], y: y + dPos[1], z: z + dPos[2]}, // FRONT TOP LEFT
		{x: x - dPos[0], y: y - dPos[1], z: z + dPos[2]}, // FRONT BOTTOM LEFT
		
		{x: x + dPos[0], y: y - dPos[1], z: z + dPos[2]}, // FRONT BOTTOM RIGHT
		{x: x + dPos[0], y: y + dPos[1], z: z + dPos[2]}, // FRONT TOP RIGHT
		
		{x: x - dPos[0], y: y + dPos[1], z: z - dPos[2]}, // BACK  TOP LEFT
		{x: x - dPos[0], y: y - dPos[1], z: z - dPos[2]}, // BACK  BOTTOM LEFT
		
		{x: x + dPos[0], y: y - dPos[1], z: z - dPos[2]}, // BACK  BOTTOM RIGHT
		{x: x + dPos[0], y: y + dPos[1], z: z - dPos[2]}, // BACK  TOP RIGHT
	];
	console.log(regresa);
	return regresa;
}
init(320, 600, 250);
initFaces(1,nPos[0],nPos[1],nPos[2]);

//Si quieren probar otras dimensiones cambiar valores del init, 
// y poner los mismos valores en arreglo nPos al comienzo.
