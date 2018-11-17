var origin = [400, 300], scale = 10, cubesData = [], sensorData = [], leSensor = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
var svg    = d3.select('.vCubo').call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
//var cubesGroup = svg.append('g').attr('class', 'cubes');
var carasPrisma = svg.append('g').attr('class', 'caras');
var nodeSensor = svg.append('g').attr('class', 'caras');
var sensorGroup = svg.append('g').attr('class', 'sensores');
var mx, my, mouseX, mouseY;
var metrosAncho = 5;
var metrosLargo = 7;
var metrosAlto = 4;
nPos = [(metrosAncho*60),(metrosAlto*60),(metrosLargo*60)] // Posiciones x,y,z

$( document ).ready(function() {
	$('.sensor').click(informe);
	$("#botonreiniciar").click(reiniciaPos);
	$("#playButton").click(testx);

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
function dataCSensor(data, tt, id, Data,tp,hr){ //ATRIBUTOS DE SENSORES
	var cubos = sensorGroup.selectAll('g.sensor').data(data, function(d){ return d.id });
	var color;
	if(tp<0){
        //console.log(tp);
        color = d3.rgb(0,0,255);
    }
    if(tp>0 && tp<=5){
        //console.log(tp);
        color = d3.rgb(0,255,255);
    }
    if(tp>5 && tp<=15){
        //console.log(tp);
        color = d3.rgb(0,255,0);
    }
    if(tp>15 && tp<=25){
        //console.log(tp);
        color = d3.rgb(255,255,0);
    }
    if(tp>25){
        //console.log(tp);
        color = d3.rgb(255,0,0);
    }
	
	var cu = cubos
		.enter()
		.append('g')
		.attr('class', 'sensor')
		.attr('fill', color ) // Relleno del cubo: ninguno
		.attr('stroke',color )// Color de los bordes: negro
		.attr('id', id)
		.attr('name', Data)
		.on('click',function(){
			var id = this.id;
			var infoAct = (document.getElementById(id).getAttribute("name"));
			var data = infoAct.split(" ");
			$('#infoSensor').html(" ");
			$('#infoSensor').append("<i class='fab fa-slack-hash'></i> "+data[0]+"<hr>");
			$('#infoSensor').append("<i class='fas fa-thermometer-half'></i> "+data[4]+"<small>ºC </small><hr>");
			$('#infoSensor').append("<i class='fas fa-water'></i> "+data[5]+"<small>% Humedad Relativa</small><hr>");
			$('#infoSensor').append("<i class='fas fa-water'></i> "+data[6]+"<small>% Humedad Suelo</small><hr>");
			$('#infoSensor').append("<i class='far fa-lightbulb'></i> "+data[7] + "% Luz");
			$('#dataSensor').modal('show');	
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
	faces.exit().remove();
}

	
function initSensor(id, posX, posY, posZ, Temperatura, Humedad_Rel, Humedad_Suelo, Luz ,radio){
	var tp = Temperatura.replace(",",".");
	var Data = id+" "+posX+" "+posY+" "+posZ+" "+Temperatura+" "+Humedad_Rel+" "+Humedad_Suelo+" "+Luz;
	//console.log(Data);

	// leSensor = [];
	var _cubo = makeSensor(posX, posY, posZ, radio);
		_cubo.id = id;
		_cubo.height = radio;
		_cubo.width = radio;
		_cubo.name = Data;
		leSensor.push(_cubo);
	dataCSensor(cubes3D(leSensor), 1000, _cubo.id,_cubo.name,tp,Humedad_Rel);
}

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
	var AlertasTemps = [];
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
					aDataSensor = [aDataid[i],-(nPos[2]/2)+(adaptZ(this.gsx$pz.$t)),(nPos[1]/2)-(this.gsx$py.$t*60),(-(nPos[0])/2)+(this.gsx$px.$t*60),this.gsx$tp.$t,this.gsx$hr.$t,this.gsx$hs.$t,this.gsx$lu.$t]
					// MODIFICAR LOS RANDOM X Y Z, CONVERTIR LA CANTIDAD RESCATADA EN METROS
					// this.gsx$px.$t this.gsx$y.$t  this.gsx$pz.$t 
					// --------------------------------------------------------------------
					initSensor(aDataSensor[0],aDataSensor[1],aDataSensor[2],aDataSensor[3],aDataSensor[4],aDataSensor[5],aDataSensor[6],aDataSensor[7],5);
					console.log("Nodo "+i+":",aDataSensor[4]+" Grados")

					if((aDataSensor[4])>"1"){
						console.log("Demasiada Temperatura");
						AlertasTemps.push(aDataSensor[0],aDataSensor[4]);
					}	
				}
			})
		}
		console.log(AlertasTemps);

		if((document.getElementById('muestrasensoralerta').innerHTML = AlertasTemps[0]) != undefined){
			document.getElementById('muestrasensoralerta').innerHTML = "El sensor "+"<b>"+AlertasTemps[0]+"</b>"+" alcanzó "+"<b>"+AlertasTemps[1]+"</b>"+" grados";
			//document.getElementByClassName('popover-body')[0].style.visibility = 'hidden';
		} else {
			document.getElementById('muestrasensoralerta').innerHTML = "No hay alertas";
		}
		//for(var i=0; i < aDataSensor.length ; i++){
		//	console.log(aDataSensor);
		//};
	});
}

function testx(){
		alert("d");
}

// FUNCION SOLO UTILIZADA PARA CAMBIAR COMA POR PUNTO DE LA POSICION Z
function adaptZ(posZ){
	var newPos = posZ.replace(",", ".");
	return (newPos*60); 
}

// FIN CODIGO DE SENSORES

initallsensor();
initFaces(1,nPos[0],nPos[1],nPos[2]);

// Si quieren probar otras dimensiones cambiar valores del init, 
// y poner los mismos valores en arreglo nPos al comienzo.

// ==========================================================
// === DATOS DE LOS SENSORES ================================
// $("#MuestraDatosJSON").click(ObtieneDatos);
//function ObtieneDatos(){
	//$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){//MODO ONLINE
//	$.getJSON('values.json', function(data){//MODO OFFLINE
//		$("#datos").append("<h2>Informacion recolectada de JSON</h2>");
//		info = data.feed.entry;//obtiene toda la informacion del json.
//		$(info).each(function(){//recorre cada fila de datos.
//			$("#datos").append("<p><b>Fecha:</b> "+ this.gsx$fecha.$t +" <b>Hora:</b> "+ this.gsx$hora.$t +" <b>Mac Concentrador:</b> "+ this.gsx$macconcentrador.$t +" <b>Mac Nodo:</b> "+ this.gsx$macnodo.$t +" <b>px:</b> "+ this.gsx$px.$t +" <b>py:</b> "+ this.gsx$py.$t +" <b>pz:</b> "+this.gsx$pz.$t +" <b>tp:</b> "+ this.gsx$tp.$t +" <b>hr:</b> "+ this.gsx$hr.$t +" <b>hs:</b> "+this.gsx$hs.$t +" <b>lu:</b> "+ this.gsx$lu.$t +" <b>al:</b> "+ this.gsx$al.$t +"</p>");
//		});
//	});
//}
