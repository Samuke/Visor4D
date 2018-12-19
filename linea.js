var parentH = $(".linT").height();

$(".play").click(play);

function play(){
	val = $(".barra").width();
	console.log("Ancho barra:" + val);
	for(i=0;i<val;i++){
		$(".progreso").css("width",i+"px");
		// console.log(i);
	}
}

