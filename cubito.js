var origin = [400, 300], scale = 10, cubesData = [], sensorData = [], leSensor = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
//var cubesGroup = svg.append('g').attr('class', 'cubes');
var carasPrisma = svg.append('g').attr('class', 'caras');
var nodeSensor = svg.append('g').attr('class', 'caras');
var sensorGroup = svg.append('g').attr('class', 'sensores');
var mx, my, mouseX, mouseY;
nPos = [250,320,600] // Posiciones x,y,z

$( document ).ready(function() {
	$('.sensor').click(informe);
	$('#nInfo').click(initSize);
	$("#botonreiniciar").click(reiniciaPos);

	function informe(){ //muestra datos de los sensores
		var id = this.id;
		var data = id.split(" ");
		var idSensor = data[0];
		var Temperatura = data[1];
		var Humedad = data[2];
		var Luminosidad = data[3];
		$("#infoSensor").html("<div class='alert alert-info'><h4>Temperatura: "+Temperatura+" ºC<br>Humedad: "+Humedad+" %<br>Luz: "+Luminosidad+" %</h4></div>");
		$("#dataSensor").modal("show");
		//alert("ID Sensor: "+idSensor+"\nTemperatura: "+Temperatura+" ?C\nHumedad: "+Humedad+" %\nLuz: "+Luminosidad+" %");	
	}
	
	function initSize(){// DIMENSIONES PRISMA (descartar)
		var x = $("#nAncho").val();
		var y = $("#nAlto").val();
		var z = $("#nLargo").val();
		nPos=[x*30,y*30,z*30];
		initFaces(1,nPos[0],nPos[1],nPos[2]);
	}
});         

var cubes3D = d3._3d()
	.shape('CUBE')
	.x(function(d){ return d.x; })
	.y(function(d){ return d.y; })
	.z(function(d){ return d.z; })
	.rotateY( startAngle)
	.rotateX(-startAngle)
	.origin(origin);


function dataFaces(data, tt){ //atributos de las caras del cubo
	var cubos = carasPrisma.selectAll('g.caras').data(data, function(d){ return d.id });

	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'caras')
		.attr('fill', d3.rgb(127, 140, 141)) //.attr('stroke', d3.rgb(0,0,0) )
		.attr('stroke', d3.rgb(0,0,0) ) // Color de los bordes: negros
		.merge(cubos);

	cubos.exit().remove();
	
	var faces = cubos.merge(cu).selectAll('path.cara').data(function(d){ return d.faces; }, function(d){ return d.face; });

	faces.enter()
		.append('path')
		.attr('class', 'cara')
		.attr('fill-opacity', 0.12) // OPACIDAD CARAS DEL PRISMA 
		.attr('stroke-width', 0.1) // ANCHURA DE COLOR (stroke) 
		.classed('le_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);
}

function initFaces(id, posX, posY, posZ){  // Creacion caras del prisma.
	sensorData = [];                        
	for(var i = 0; i < 3; i++){ // FOR PARA CREAR LAS 3 CARAS NECESARIAS EN EL GRAFICO
		if(i == 0){ 			// ARREGLO nPos SON LAS DIMENSIONES EN PX DEL PRISMA, ESTA CREADA AL COMIENZO.
			nDraw = [posZ/2,0,posX/2]    // ARREGLO DONDE SE PASA DIMENSIONES X,Y,Z PARA UTILIZARLO EN makeFaces.
			var _cubo = makeFaces(0,posY/2, 0, nDraw); // CARA DE BASE.
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
			var _cubo = makeFaces(0,0,-posX/2, nDraw); // CARA FONDO.
				_cubo.id = 'cara' + 3;
				sensorData.push(_cubo);
		}
	}
	dataFaces(cubes3D(sensorData), 1000);
}

// FUNCIONES PARA PODER GIRAR/ROTAR EL CUBO

function dragStart(){
	mx = d3.event.x;
	my = d3.event.y;}

function dragged(){
	mouseX = mouseX || 0;
	mouseY = mouseY || 0;
	beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
	alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);

	dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(leSensor), 0);
	dataFaces(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

function dragEnd(){
	mouseX = d3.event.x - mx + mouseX;
	mouseY = d3.event.y - my + mouseY;}

function reiniciaPos(){
	beta=0;alpha=0;mouseX=0;mouseY=0;
	
	dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(leSensor), 0);
	dataFaces(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

function makeFaces(x, y, z, dPos){
	return [
		{x: x - dPos[0], y: y + dPos[1], z: z + dPos[2]}, // Parte Frente - Arriba izquierda
		{x: x - dPos[0], y: y - dPos[1], z: z + dPos[2]}, // Parte Frente - Abajo izquierda
		
		{x: x + dPos[0], y: y - dPos[1], z: z + dPos[2]}, // Parte Frente - Abajo derecha
		{x: x + dPos[0], y: y + dPos[1], z: z + dPos[2]}, // Parte Frente - Arriba derecha
		
		{x: x - dPos[0], y: y + dPos[1], z: z - dPos[2]}, // Parte Atras - Arriba izquierda
		{x: x - dPos[0], y: y - dPos[1], z: z - dPos[2]}, // Parte Atras - Abajo izquierda
		
		{x: x + dPos[0], y: y - dPos[1], z: z - dPos[2]}, // Parte Atras - Abajo derecha
		{x: x + dPos[0], y: y + dPos[1], z: z - dPos[2]}, // Parte Atras - Arriba derecha
	];
}

// CODIGO PARA SENSORES
function dataCSensor(data, tt, id, Data){ //ATRIBUTOS DE SENSORES
	var cubos = sensorGroup.selectAll('g.sensor').data(data, function(d){ return d.id });
	
	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'sensor')
		.attr('fill', d3.rgb(255,84,14) ) // Relleno del cubo: ninguno
		.attr('stroke', d3.rgb(255,84,14) )// Color de los bordes: negro
		.attr('id', id+" "+Data)
		.attr('name', Data)

		.merge(cubos);

	var faces = cubos.merge(cu).selectAll('path.cara').data(function(d){ return d.faces; }, function(d){ return d.face; });
	faces.enter()
		.append('path')
		.attr('class', 'cara')
		.attr('fill-opacity', 0.3)
		.attr('stroke-width', 1.5)
		.classed('le_3d', true)
		.merge(faces)
		.transition().duration(tt)
		.attr('d', cubes3D.draw);
	faces.exit().remove();}
	
function initSensor(id, posX, posY, posZ, radio){
	// SE GENERAN VALORES ALEATORIOS QUE SERAN ASIGNADOS A CADA SENSOR
	var Temperatura = Math.floor(Math.random() * 100) + 1;
	var Humedad = Math.floor(Math.random() * 100) + 1;
	var Luminosidad = Math.floor(Math.random() * 100) + 1;
	var Data = Temperatura+" "+Humedad+" "+Luminosidad;
	
	// leSensor = [];
	var _cubo = makeSensor(posX, posY, posZ, radio);
		_cubo.id = 'sensor' + id;
		_cubo.height = radio;
		_cubo.width = radio;
		_cubo.name = Data;
		leSensor.push(_cubo);
	dataCSensor(cubes3D(leSensor), 1000, _cubo.id,_cubo.name);}

function makeSensor(x, y, z, radio){ //CREACION DE LAS CARAS DEL PRISMA
	return [
		{x: x - radio, y: y + radio, z: z + radio}, // Parte frente - Arriba izquierda
		{x: x - radio, y: y - radio, z: z + radio}, // Parte frente - Abajo izquierda
		
		{x: x + radio, y: y - radio, z: z + radio}, // Parte frente - Abajo derecha
		{x: x + radio, y: y + radio, z: z + radio}, // Parte frente - Arriba derecha
		
		{x: x - radio, y: y + radio, z: z - radio}, // Parte atras - Arriba izquierda
		{x: x - radio, y: y - radio, z: z - radio}, // Parte atras - Abajo izquierda
		
		{x: x + radio, y: y - radio, z: z - radio}, // Parte atras - Abajo derecha
		{x: x + radio, y: y + radio, z: z - radio}, // Parte atras - Arriba derecha
	];
}

function initallsensor(){ // POSICIONA TODOS LOS SENSORES EN EL VISOR (CUBO)
	aSensor = [[1,-180,150,10,5],[2,20,110,120,5],[3,-30,30,30,5],[4,40,-140,40,5],[5,250,-120,-50,5]];
	for(var i=0;i<5;i++){
		initSensor(aSensor[i][0],aSensor[i][1],aSensor[i][2],aSensor[i][3],aSensor[i][4]);
	}
}

// FIN CODIGO DE SENSORES


initallsensor();
initFaces(1,nPos[0],nPos[1],nPos[2]);

// Si quieren probar otras dimensiones cambiar valores del init, 
// y poner los mismos valores en arreglo nPos al comienzo.

// ==========================================================
// === DATOS DE LOS SENSORES ================================
$("#MuestraDatosJSON").click(ObtieneDatos);
function ObtieneDatos(){
	//$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){//MODO ONLINE
	$.getJSON('values.json', function(data){//MODO OFFLINE
		$("#datos").append("<h2>Informacion recolectada de JSON</h2>");
		info = data.feed.entry;//obtiene toda la informacion del json.
		$(info).each(function(){//recorre cada fila de datos.
			$("#datos").append("<p><b>Fecha:</b> "+ this.gsx$fecha.$t +" <b>Hora:</b> "+ this.gsx$hora.$t +" <b>Mac Concentrador:</b> "+ this.gsx$macconcentrador.$t +" <b>Mac Nodo:</b> "+ this.gsx$macnodo.$t +" <b>px:</b> "+ this.gsx$px.$t +" <b>py:</b> "+ this.gsx$py.$t +" <b>pz:</b> "+this.gsx$pz.$t +" <b>tp:</b> "+ this.gsx$tp.$t +" <b>hr:</b> "+ this.gsx$hr.$t +" <b>hs:</b> "+this.gsx$hs.$t +" <b>lu:</b> "+ this.gsx$lu.$t +" <b>al:</b> "+ this.gsx$al.$t +"</p>");
		});
	});
}