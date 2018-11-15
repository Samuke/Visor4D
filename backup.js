var origin = [290, 300], scale = 10, cubesData = [], sensorData = [], leSensor = [], alpha = 200, beta = 200, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
//var cubesGroup = svg.append('g').attr('class', 'cubes');
var carasPrisma = svg.append('g').attr('class', 'caras');
var nodeSensor = svg.append('g').attr('class', 'caras');
var sensorGroup = svg.append('g').attr('class', 'sensores');
var mx, my, mouseX, mouseY;
nPos = [(5*80)/2,(4*80)/2,(7*80)/2] // Posiciones x,y,z 5mX, 4mY,7mZ

$( document ).ready(function() {
	function ObtieneDatos(){
		//$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){//MODO ONLINE
		$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){//MODO OFFLINE
			$("#datos").append("<h2>Informacion recolectada de JSON</h2>");
			info = data.feed.entry;//obtiene toda la informacion del json.
			$(info).each(function(){//recorre cada fila de datos.
				$("#datos").append("<p><b>Fecha:</b> "+ this.gsx$fecha.$t +" <b>Hora:</b> "+ this.gsx$hora.$t +" <b>Mac Concentrador:</b> "+ this.gsx$macconcentrador.$t +" <b>Mac Nodo:</b> "+ this.gsx$macnodo.$t +" <b>px:</b> "+ this.gsx$px.$t +" <b>py:</b> "+ this.gsx$py.$t +" <b>pz:</b> "+this.gsx$pz.$t +" <b>tp:</b> "+ this.gsx$tp.$t +" <b>hr:</b> "+ this.gsx$hr.$t +" <b>hs:</b> "+this.gsx$hs.$t +" <b>lu:</b> "+ this.gsx$lu.$t +" <b>al:</b> "+ this.gsx$al.$t +"</p>");
			});
		});
	}

	//$('.sensores').click(informe);
	$("#botonreiniciar").click(reiniciaPos);
	$("#MuestraDatosJSON").click(ObtieneDatos);

	//function informe(){ //muestra datos de los sensores
		//document.getElementById("9999999");
		//alert($(this).attr("id"));
		//var data = (document.getElementById("9999998").getAttribute("name"));
		//alert(data);
		//var data = id.split(" ");
		//var idSensor = data[0];
		//var Temperatura = data[1];
		//var Humedad = data[2];
		//var Luminosidad = data[3];
		//alert(data);
		//console.log(id);
	
	//}
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
			var _cubo = makeFaces(posZ/2,0, posX/2, nDraw); // CARA DE BASE.
				_cubo.id = 'cara' + 1;
				sensorData.push(_cubo);
		}
		if(i == 1){ 	
			nDraw = [0,posY/2,posX/2]   
			var _cubo = makeFaces(posZ,-posY/2,posX/2, nDraw); // CARA DERECHA.
				_cubo.id = 'cara' + 2;
				sensorData.push(_cubo);
		}
		if(i == 2){ 	
			nDraw = [posZ/2,posY/2,0]
			var _cubo = makeFaces(posZ/2,-posY/2,0, nDraw); // CARA FONDO.
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
		.attr('id', id)
		.attr('name', Data)
		.on('click',function(){
			var id = this.id;
			var infoAct = (document.getElementById(id).getAttribute("name"));
			alert(infoAct);
		})

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
	
function initSensor(id, posX, posY, posZ, Temperatura, Humedad_Rel, Humedad_Suelo, Luz ,radio){
	
	var Data = id+" "+posX+" "+posY+" "+posZ+" "+Temperatura+" "+Humedad_Rel+" "+Humedad_Suelo+" "+Luz;
	console.log(Data);
	// leSensor = [];
	var _cubo = makeSensor(posZ, posY, posX, radio); //z y x
		_cubo.id = id;
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
	var Digital=new Date();
	var hora_actual=Digital.getHours();
	var aDataid = [];
	var aDataSensor = [];
	var aDataAll = [];
	// PRIMERO RESCATAREMOS LAS IDS QUE LLEGAN DE LOS NODOS EN EL JSON
	$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){
		info = data.feed.entry;//obtiene toda la informacion del json.
		$(info).each(function(){
			
			//recorre cada fila de datos.
			if(aDataid.indexOf(this.gsx$macnodo.$t)==-1){
				aDataid.push(this.gsx$macnodo.$t);
			}	
		});

		//PARA CADA ID DEL ARRAY, SE GUARDARAN EN OTRO ARRAY LOS DATOS EN LA HORA ACTUAL. (NO DIA).
		for(var i=0; i < aDataid.length ; i++){
			$(info).each(function(){
				var ax = (this.gsx$hora.$t).split(":");
				if(this.gsx$macnodo.$t == aDataid[i] && ax[0] == hora_actual){
					alert(this.gsx$px.$t);
					var py = this.gsx$py.$t;
					var pz = this.gsx$pz.$t;
					aDataSensor = [aDataid[i],adaptZ(this.gsx$pz.$t),-(this.gsx$py.$t*80)/2,(this.gsx$px.$t*80)/2,this.gsx$tp.$t,this.gsx$hr.$t,this.gsx$hs.$t,this.gsx$lu.$t]
					initSensor(aDataSensor[0],aDataSensor[1],aDataSensor[2],aDataSensor[3],aDataSensor[4],aDataSensor[5],aDataSensor[6],aDataSensor[7],5);
					
				}
			})
		}

	
	});
}

function adaptZ(posZ){
	var newPos = posZ.replace(",", ".");
	return (newPos*80)/2; 
}
//$("#datos").append("<p><b>Fecha:</b> "+ this.gsx$fecha.$t +" <b>Hora:</b> "+ this.gsx$hora.$t +" <b>Mac Concentrador:</b> "+ this.gsx$macconcentrador.$t +" <b>Mac Nodo:</b> "+ this.gsx$macnodo.$t +" <b>px:</b> "+ this.gsx$px.$t +" <b>py:</b> "+ this.gsx$py.$t +" <b>pz:</b> "+this.gsx$pz.$t +" <b>tp:</b> "+ this.gsx$tp.$t +" <b>hr:</b> "+ this.gsx$hr.$t +" <b>hs:</b> "+this.gsx$hs.$t +" <b>lu:</b> "+ this.gsx$lu.$t +" <b>al:</b> "+ this.gsx$al.$t +"</p>");
// FIN CODIGO DE SENSORES

initFaces(1,nPos[0],nPos[1],nPos[2]);
initallsensor();

 



// Si quieren probar otras dimensiones cambiar valores del init, 
// y poner los mismos valores en arreglo nPos al comienzo.