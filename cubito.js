function visor(metrosAncho, metrosLargo, metrosAlto, datosJSON, eFecha){
	var origin = [400, 300], cubesData = [], sensorData = [], leSensor = [], alpha = 0, beta = 0, startAngle = Math.PI/6;
	var svg    = d3.select('.vCubo').
				call(d3.drag().
				on('drag', Arrastra).
				on('start', InicioArrastra).
				on('end', FinArrastra)).
				call(d3.zoom().
				scaleExtent([1, 3]).
				on("zoom", zoomed)).
				append('g');
	var carasPrisma = svg.append('g').attr('class', 'caras');
	var nodeSensor = svg.append('g').attr('class', 'caras');
	var sensorGroup = svg.append('g').attr('class', 'sensores');
	var mx, my, mouseX, mouseY;
	var mTk, mTx, mTy, reiniciado = false;
	// var metrosAncho = 5, metrosLargo = 4, metrosAlto = 4;//Dimensiones del cubo
	nPos = [(metrosAncho*60),(metrosAlto*60),(metrosLargo*60)] // Posiciones x,y,z
	var dataPlayer = [], horasRep = [], anchoProgreso = 1, cont = 0, timer = 0, pausado = false;
	var tHoras = ["0:00","1:00","2:00","3:00","4:00","5:00","6:00","7:00",
				 "8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00",
				 "17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

	var aDataid = [], aDataSensor = [], AlertasTemps = [], ArrayAlertas = [];
	var VarTemperatura = [], VarHumedadRelativa = [], VarHumedadSuelo = [], VarLuminosidad = [], ArrayTemperatura = [], ArrayHumedadRelativa = [], ArrayHumedadSuelo = [], ArrayLuminosidad = []; 

	// var eFecha = "3/10/2018";//fecha que eligio el usuario.
	var Datex = new Date();
	var HoraActual = Datex.getHours();
	var tiempoData = HoraActual+":00";
	var nIn, act;
	var cubes3D = d3._3d()
		.shape('CUBE')
		.x(function(d){ return d.x; })
		.y(function(d){ return d.y; })
		.z(function(d){ return d.z; })
		.rotateY( startAngle)
		.rotateX(-startAngle)
		.origin(origin);

	$(function () {   
	  $('[data-toggle="popover"]').popover() 
	});

	$('body').click(function(e){
		if ($(e.target).parent().find('[data-toggle="popover"]').length > 0) {
			$('#popoverinfonodos').popover('hide');
		}
	});
	// === PRINCIPAL ================================================================
	$(document).ready(function(){
		$("#miTiempo").html(tiempoData);

		$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){
			info = data.feed.entry;//obtiene toda la informacion del json.
			$(info).each(function(){//recorre cada fila de datos.
				dataPlayer.push([this.gsx$macnodo.$t,-(nPos[2]/2)+(adaptZ(this.gsx$pz.$t)),(nPos[1]/2)-(this.gsx$py.$t*60),(-(nPos[0])/2)+(this.gsx$px.$t*60),this.gsx$tp.$t,this.gsx$hr.$t,this.gsx$hs.$t,this.gsx$lu.$t,this.gsx$hora.$t]);
			});
		});
		for (var i = 0; i < tHoras.length; i++) {
			if(tiempoData==tHoras[i]){
				nIn = i;
			}
		}
		for (var i = 0; i < tHoras.length; i++) {
			act = nIn+i;
			if(act>=tHoras.length){
				i=0;
				nIn=0;
			}
			if(horasRep.length<=tHoras.length){
				horasRep.push(tHoras[nIn+i]);
			}
		}
		// console.log(horasRep);
		initallsensor(tiempoData);
		initFaces(1,nPos[0],nPos[1],nPos[2]);
		// Si quieren probar otras dimensiones cambiar valores del init, 
		// y poner los mismos valores en arreglo nPos al comienzo.
		muestrainfocubo();
		
		$(".sensores").click(informe);
		$("#botonreiniciar").click(reiniciaPos);
		$("#playButton").click(reproduce);
		$("#reiniAncho").click(testo);
		$("#alertita").click(cambiaHora);
	});// ===========================================================================

	function muestrainfocubo(){
		var ArrayInfoCubo = [];
		ArrayInfoCubo.push("<div>Ancho: <b>"+ metrosAncho +"</b> metros</div>","<div>Largo: &nbsp;"+"<b>"+ metrosLargo +"</b> metros</div>","<div>Alto: &nbsp;&nbsp;&nbsp;&nbsp;<b>"+ metrosAlto +"</b> metros</div>");
		$("#muestrainfocubo").html(ArrayInfoCubo);
	}

	function informe(e){ //muestra datos de los sensores
		var id = this.id;
		var data = id.split(" ");
		var idSensor = data[0];
		var Temperatura = data[1];
		var Humedad = data[2];
		var Luminosidad = data[3];

		var PosXmouse = e.pageX,
			PosYmouse = e.pageY;

		// console.log(PosXmouse,PosYmouse);
		var pipovernodos = document.getElementById('popoverinfonodos')

		pipovernodos.style.left = PosXmouse+15+"px"
		pipovernodos.style.top = PosYmouse+"px"
		$('#popoverinfonodos').popover('show');	
		setTimeout(function(){
			$('#popoverinfonodos').popover('hide');	
		}, 4000);

	}

	function initSize(){// DIMENSIONES PRISMA (descartar)
		var x = $("#nAncho").val();
		var y = $("#nAlto").val();
		var z = $("#nLargo").val();
		nPos=[x*30,y*30,z*30];
		initFaces(1,nPos[0],nPos[1],nPos[2]);
	}

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
				nDraw = [posZ/2,0,posX/2]    // ARREGLO DONDE SE PASA DIMENSIONES X,Y,Z PARA UTILIZARLO EN creaCaras.
				var _cubo = creaCaras(0,posY/2, 0, nDraw); // CARA DE BASE.
					_cubo.id = 'cara' + 1;
					sensorData.push(_cubo);
			}
			if(i == 1){ 	
				nDraw = [0,posY/2,posX/2]   
				var _cubo = creaCaras(posZ/2,0, 0, nDraw); // CARA DERECHA.
					_cubo.id = 'cara' + 2;
					sensorData.push(_cubo);
			}
			if(i == 2){ 	
				nDraw = [posZ/2,posY/2,0]
				var _cubo = creaCaras(0,0,-posX/2, nDraw); // CARA FONDO.
					_cubo.id = 'cara' + 3;
					sensorData.push(_cubo);
			}
		}
		dataFaces(cubes3D(sensorData), 1000);
	}

	// FUNCIONES PARA PODER GIRAR/ROTAR EL CUBO
	function InicioArrastra(){
		mx = d3.event.x;
		my = d3.event.y;}

	function Arrastra(){
		mouseX = mouseX || 0;
		mouseY = mouseY || 0;
		beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
		alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);

		dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(leSensor), 0);
		dataFaces(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

	function FinArrastra(){
		mouseX = d3.event.x - mx + mouseX;
		mouseY = d3.event.y - my + mouseY;}

	function reiniciaPos(){
		beta=0;alpha=0;mouseX=0;mouseY=0;
		svg.attr("transform", d3.zoomIdentity.translate(0,0).scale(1) );
		mTk = 1, mTx = 0, mTy = 0;
		
		dataCSensor(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(leSensor), 0);
		dataFaces(cubes3D.rotateY(beta + startAngle).rotateX(alpha - startAngle)(sensorData), 0);}

	function zoomed(){
		if(reiniciado){
			d3.event.transform = {k: mTk, x: mTx, y: mTy};
			reiniciado = false;}
		mTk = d3.event.transform.k;
		mTx = d3.event.transform.x;
		mTy = d3.event.transform.y;
		svg.attr("transform", d3.event.transform);
		d3.event.transform = {k: mTk, x: mTx, y: mTy};
	}

	function creaCaras(x, y, z, dPos){
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

	function asgColor(tp){
		if(tp<0){ color = d3.rgb(0,0,255);}
		if(tp>0 && tp<=5){ color = d3.rgb(0,255,255);}
		if(tp>5 && tp<=15){ color = d3.rgb(0,255,0);}
		if(tp>15 && tp<=25){ color = d3.rgb(255,255,0);}
		if(tp>25){ color = d3.rgb(255,0,0);}
		return color;
	}

	// CODIGO PARA SENSORES
	function dataCSensor(data, tt, id, Data,tp,hr){ //ATRIBUTOS DE SENSORES
		var cubos = sensorGroup.selectAll('g.sensor').data(data, function(d){ return d.id });
		var color = asgColor(tp); 
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
				$('#muestrainfonodos').html(" ");
				$('#muestrainfonodos').append("<i class='fab fa-slack-hash'></i> "+data[0]+"<hr>");
				$('#muestrainfonodos').append("<i class='fas fa-thermometer-half'></i> "+data[4]+"<small>ºC </small><hr>");
				$('#muestrainfonodos').append("<i class='fas fa-tint'></i> "+data[5]+"<small>% Humedad Relativa</small><hr>");
				$('#muestrainfonodos').append("<i class='fas fa-tint'></i> "+data[6]+"<small>% Humedad Suelo</small><hr>");
				$('#muestrainfonodos').append("<i class='far fa-lightbulb'></i> "+data[7] + "% Luz");	
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
		var _cubo = creaSensor(posX, posY, posZ, radio);
			_cubo.id = id;
			_cubo.height = radio;
			_cubo.width = radio;
			_cubo.name = Data;
			leSensor.push(_cubo);
		dataCSensor(cubes3D(leSensor), 1000, _cubo.id,_cubo.name,tp,Humedad_Rel);
	}

	function creaSensor(x, y, z, radio){ //CREACION DE LAS CARAS DEL PRISMA
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

	function initallsensor(tiempoData){ // POSICIONA TODOS LOS SENSORES EN EL VISOR (CUBO)
		// PRIMERO RESCATAREMOS LAS IDS QUE LLEGAN DE LOS NODOS EN EL JSON
		$.getJSON('https://spreadsheets.google.com/feeds/list/1DH9h8ZMBNLyW-WatGSSRdsBHFh6lQr0oa17ZU_AfZrU/od6/public/values?alt=json', function(data){
			info = data.feed.entry;//obtiene toda la informacion del json.
			$(info).each(function(){
				//recorre cada fila de datos.
				if(aDataid.indexOf(this.gsx$macnodo.$t)==-1){
					aDataid.push(this.gsx$macnodo.$t);
				}
				
			});
			dibujaSensor(info, tiempoData);
			infoPopups();//informacion de para mostrar en los pop-ups
		});
	}

	function dibujaSensor(info, tiempoData){
		for(var i=0; i < aDataid.length ; i++){
				$(info).each(function(){
					var ax = (this.gsx$hora.$t).split(":");
					if(this.gsx$macnodo.$t == aDataid[i] && this.gsx$hora.$t == tiempoData && this.gsx$fecha.$t == eFecha){
						aDataSensor = [aDataid[i],-(nPos[2]/2)+(adaptZ(this.gsx$pz.$t)),(nPos[1]/2)-(this.gsx$py.$t*60),(-(nPos[0])/2)+(this.gsx$px.$t*60),this.gsx$tp.$t,this.gsx$hr.$t,this.gsx$hs.$t,this.gsx$lu.$t]
						
						// MODIFICAR LOS RANDOM X Y Z, CONVERTIR LA CANTIDAD RESCATADA EN METROS
						// this.gsx$px.$t this.gsx$y.$t  this.gsx$pz.$t 
						// --------------------------------------------------------------------
						initSensor(aDataSensor[0],aDataSensor[1],aDataSensor[2],aDataSensor[3],aDataSensor[4],aDataSensor[5],aDataSensor[6],aDataSensor[7],5);
						// console.log("Nodo "+i+":",aDataSensor[4]+" Grados")

						VarTemperatura.push		([aDataSensor[0],aDataSensor[4]]);
						VarHumedadRelativa.push ([aDataSensor[0],aDataSensor[5]]);
						VarHumedadSuelo.push	([aDataSensor[0],aDataSensor[6]]);
						VarLuminosidad.push		([aDataSensor[0],aDataSensor[7]]);

						if((aDataSensor[4])>"1"){
							// console.log("Demasiada Temperatura");
							AlertasTemps.push([aDataSensor[0],aDataSensor[4]]);
						}
					}
				});
		}
	}

	function infoPopups(){
		for(var i=0;i<AlertasTemps.length;i++){ ArrayAlertas.push("<div>El sensor <b>"+ AlertasTemps[i][0] +"</b> alcanzó <b>"+ AlertasTemps[i][1] +"</b> grados</div>");}
		for(var i=0;i<VarTemperatura.length;i++){ ArrayTemperatura.push("<div id='test2'>El sensor N° <b>"+ VarTemperatura[i][0] +"</b> tiene una Temperatura de <b>"+ VarTemperatura[i][1] +"</b></div>");}
		for(var i=0;i<VarHumedadRelativa.length;i++){ ArrayHumedadRelativa.push("<div>El sensor N° <b>"+ VarHumedadRelativa[i][0] +"</b> tiene una Humedad relativa de <b>"+ VarHumedadRelativa[i][1] +"</b></div>");}
		for(var i=0;i<VarHumedadSuelo.length;i++){ ArrayHumedadSuelo.push("<div>El sensor N° <b>"+ VarHumedadSuelo[i][0] +"</b> tiene una Humedad de suelo de <b>"+ VarHumedadSuelo[i][1] +"</b></div>");}
		for(var i=0;i<VarLuminosidad.length;i++){ ArrayLuminosidad.push("<div>El sensor N° <b>"+ VarLuminosidad[i][0] +"</b> tiene una luminosidad de <b>"+ VarLuminosidad[i][1] +"</b></div>");}
		
		// console.log("AlertasTemps[0]: "+ AlertasTemps[0]);
		if(AlertasTemps[0] != undefined){ $("#muestrasensoralerta").html(ArrayAlertas);
		}else{ $("#muestrasensoralerta").html("No hay alertas");}

		if(VarTemperatura[0] != undefined){ $("#muestratemp").html(ArrayTemperatura);
		}else{ $("#muestratemp").html("No hay variables");}

		if(VarHumedadRelativa[0] != undefined){ $("#muestrahumedadre").html(ArrayHumedadRelativa);
		}else{ $("#muestrahumedadre").html("No hay variables");}

		if(VarHumedadSuelo[0] != undefined){ $("#muestrahumedadsu").html(ArrayHumedadSuelo);
		}else{ $("#muestrahumedadsu").html("No hay variables");}

		if(VarLuminosidad[0] != undefined){ $("#muestraluminosidad").html(ArrayLuminosidad);
		}else{ $("#muestraluminosidad").html("No hay variables");}
	}

	function cambiaHora(){
		$("#muestratemp").html("");
		VarTemperatura  = [];VarHumedadRelativa = [];VarHumedadSuelo = [];VarLuminosidad = [];AlertasTemps = [];
		ArrayTemperatura = [];ArrayLuminosidad = [];ArrayAlertas = [];ArrayHumedadSuelo = [];ArrayHumedadRelativa = [];
		tiempoData = "19:00";
		for (var j = 0 ; j < dataPlayer.length; j++){// Recorremos todos los datos
			if(dataPlayer[j][8] == tiempoData){// Y vemos en donde la hora de este NODO sea igual a la hora actual recorrida.
				var tp = adaptZ(dataPlayer[j][4])/60;// obtenemos la temperatura del arreglo donde tenemos toda la info.
				var color = asgColor(tp);				
				$("#"+dataPlayer[j][0]).attr("fill",color);//Graficamos el nodo segun temperatura de la hora 
				$("#"+dataPlayer[j][0]).attr("stroke",color);
				VarTemperatura.push		([dataPlayer[j][0],dataPlayer[j][4]]);
				VarHumedadRelativa.push ([dataPlayer[j][0],dataPlayer[j][5]]);
				VarHumedadSuelo.push	([dataPlayer[j][0],dataPlayer[j][6]]);
				VarLuminosidad.push		([dataPlayer[j][0],dataPlayer[j][7]]);
				var xData = dataPlayer[j][0]+" "+dataPlayer[j][1]+" "+dataPlayer[j][2]+" "+dataPlayer[j][3]+" "+dataPlayer[j][4]+" "+dataPlayer[j][5]+" "+dataPlayer[j][6]+" "+dataPlayer[j][7];
				$("#"+dataPlayer[j][0]).attr("name",xData)
				var infoAct = (document.getElementById(dataPlayer[j][0]).getAttribute("name"));
				var data2 = infoAct.split(" ");
				$("#"+data2[0]).on('click',function(){
					$('#muestrainfonodos').html(" ");
					$('#muestrainfonodos').append("<i class='fab fa-slack-hash'></i> "+data2[0]+"<hr>");
					$('#muestrainfonodos').append("<i class='fas fa-thermometer-half'></i> "+data2[4]+"<small>ºC </small><hr>");
					$('#muestrainfonodos').append("<i class='fas fa-tint'></i> "+data2[5]+"<small>% Humedad Relativa</small><hr>");
					$('#muestrainfonodos').append("<i class='fas fa-tint'></i> "+data2[6]+"<small>% Humedad Suelo</small><hr>");
					$('#muestrainfonodos').append("<i class='far fa-lightbulb'></i> "+data2[7] + "% Luz");	
				});
				if((aDataSensor[4])>"1"){
					AlertasTemps.push([aDataSensor[0],aDataSensor[4]]);
				}	
			}
		}
		infoPopups()
		$("#miTiempo").html(tiempoData);//muestra la hora a la que se cambio
	}

	function reproduceData(i){
		i = timer;
		// console.log(dataPlayer[0]);
		if(i<horasRep.length && !pausado){ // Vamos recorriendo todas las horas de 0:00 hasta 0:00
			for (var j=0;j<dataPlayer.length;j++){ // Recorremos todos los datos
				if(dataPlayer[j][8] == horasRep[i]){    // Y vemos en donde la hora de este NODO sea igual a la hora actual recorrida.
					var tp = adaptZ(dataPlayer[j][4])/60;    // obtenemos la temperatura del arreglo donde tenemos toda la info.
					var color = asgColor(tp);
					$("#"+dataPlayer[j][0]).attr("fill",color);     //Graficamos el nodo segun temperatura de la hora 
					$("#"+dataPlayer[j][0]).attr("stroke",color);
					$("#miTiempo").html(horasRep[i]);
					anchoProgreso++;
					$(".progreso").css("width",anchoProgreso+"%");
					if(anchoProgreso>99){ break;};
				}
			}
			timer++;
			setTimeout(function(){ reproduceData(timer)},1000);
		}else if(!pausado){
			$("#playButton").removeClass("fa-pause");
			$("#playButton").addClass("fa-redo-alt");
			cont = 2;
		}
	}

	function reproduce(){
		cont++;
		switch(cont){
			case 1:
				if(pausado){ pausado = false;}
				$("#playButton").removeClass("fa-play");
				$("#playButton").addClass("fa-pause");
				reproduceData(timer);
				break;
			case 2:
				cont=0, pausado = true;
				$("#playButton").removeClass("fa-pause");
				$("#playButton").addClass("fa-play");
				break;
			case 3:
				// console.log("cont case 3: "+ cont);
				cont=1, timer = 0, anchoProgreso = 0;
				$(".progreso").css("transition","initial");
				$(".progreso").css("width",anchoProgreso+"px");
				$("#playButton").removeClass("fa-redo-alt");
				$("#playButton").addClass("fa-pause");
				setTimeout(function(){ $(".progreso").css("transition","ease 2s");},100);
				reproduceData(timer);
				break;
		}
	}

	// FUNCION SOLO UTILIZADA PARA CAMBIAR COMA POR PUNTO DE LA POSICION Z
	function adaptZ(posZ){
		var newPos = posZ.replace(",", ".");
		return (newPos*60); 
	}

}