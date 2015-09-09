<?php
include('include/db.inc.php');
?><!doctype html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="http://openlayers.org/en/v3.0.0/css/ol.css" type="text/css">
    <link rel="stylesheet" href="style.css" type="text/css">
    <script src="http://openlayers.org/en/v3.0.0/build/ol.js" type="text/javascript"></script>
    <title>Search Demo 2</title>
  </head>
  <body>
    <div id="map" class="map"></div>
    <script type="text/javascript">
    

   <?php
      	$query = " SELECT * 
            FROM website_layers
            ORDER BY id ASC";
            
            $result = @pg_query($GLOBALS['dbconn'],$query) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 
  $komma = "";
    while($var_gegevens = pg_fetch_array($result)) {
       echo "  layer[".$var_gegevens['id']."] = new ol.layer.Image({
    extent: [250000, 6630000, 500000, 6770000],
    source: new ol.source.ImageWMS({
      url: 'http://we12s007.ugent.be:8080/geoserver/search/wms',
      params: {'LAYERS': '".$var_gegevens['name']."'},
      serverType: 'geoserver'
      }),
    visible:".$var_gegevens['visible']."
  })
  ";
    }
    ?>
    
    

    
var layers = [
  new ol.layer.Tile({
      source: new ol.source.OSM()
  }),
  <?php
      	$query = " SELECT * 
            FROM website_layers
            ORDER BY order_draw ASC";
            
            $result = @pg_query($GLOBALS['dbconn'],$query) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 
  $komma = "";
    while($var_gegevens = pg_fetch_array($result)) {
       echo $komma."layer[".$var_gegevens['id']."]";
       $komma = ",
       ";
    }
    ?>
  
];


           
var view = new ol.View({
    center: [375000, 6700000],
    zoom: 9
  })

var map = new ol.Map({
  controls: [],
  layers: layers,
  target: 'map',
  view: view
});
     




map.on('singleclick', function(evt) {
  var url = 'ajax/featureinfo.php?x=' + evt.coordinate[0] +'&y=' + evt.coordinate[1] +'&res='+ view.getResolution();
       
     url = url <?php   
      


         $url="";
      $query2 = " SELECT * 
            FROM website_layers
            ORDER BY id ASC";
            
            $result2 = @pg_query($GLOBALS['dbconn'],$query2) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 
    while($var_gegevens2 = pg_fetch_array($result2)) {
    	   $url = $url."+'&l".$var_gegevens2['id']."=' + visible(".$var_gegevens2['id'].")";
    	   
    }
    
    echo $url;

   ?>

  
  document.getElementById("info").style.display="block";
  ajax (url,'info','','');
  
})


function visible(nr){
	return ! (document.getElementById("l"+nr).className == "layer") ;
}



function layer(nr){
			
	if (document.getElementById("l"+nr).className == "layer"){
		document.getElementById("l"+nr).className = "layer_active";
		
		layer[nr].setVisible(true);
		document.getElementById("legende_"+nr).style.display = "block";
		
	}else{
		document.getElementById("l"+nr).className = "layer";
		
		layer[nr].setVisible(false);
		document.getElementById("legende_"+nr).style.display = "none";
	}

	
}



function toggle_legende(){
	if (document.getElementById("leg").style.display=="block"){
	   document.getElementById("leg").style.display="none"
	}else{
	   document.getElementById("leg").style.display="block"
	}
}








function ajax(alink, aelementid, adata, aconfirm){



//bevestiging vragen indien nodig
if (aconfirm){
  var answer = confirm(aconfirm)
}

//uitvoeren indien bevestiging niet gevraagd of ok
if (answer || aconfirm == ""){

// ajax
var xmlHttp;try{xmlHttp=new XMLHttpRequest();}catch (e){try{xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");}catch (e){try{xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");}catch (e){alert("Deze functie werkt niet op jouw computer, gelieve contact op te nemen met webmaster@kazou-gent.be");return false;}}}xmlHttp.onreadystatechange=function(){if(xmlHttp.readyState==4){

// uitvoeren als pagina is opgeroepen.  xmlHttp.responseText is de inhoud van de opgeroepen pagina
document.getElementById(aelementid).innerHTML = xmlHttp.responseText;
document.getElementById(aelementid).style.opacity = 1;

}}



// opbouwen postdata die moet worden meegezonden



if (adata==''){
  sdata = null;
}else{

 

  sdata = '';
  arr_adata = adata.split(",");
  en='';
  for (i in arr_adata){
    arr_data = arr_adata[i].split("@"); 

   
    if (arr_data[0] == "t"){
	  waarde = document.getElementById(arr_data[1]).value
	  waarde = waarde.replace(/&/g, "�")
      sdata = sdata + en + arr_data[1] + '=' + waarde;    
    }
    if (arr_data[0] == "c"){
    

      sdata = sdata + en + arr_data[1] + '=' + document.getElementById(arr_data[1]).checked;    
    } 
    if (arr_data[0] == "r"){
      radio_data = arr_data[1].split("#"); 
      if (document.getElementById(arr_data[1]).checked){
        sdata = sdata + en + radio_data[0] + '=' +radio_data[1]; 
      }else{
        skip=true;
      }     
    }    
    en="&";
  }
}


//plaatsen loaderke
document.getElementById(aelementid).style.opacity = 0.3;

// pagina die opgeroepen moet worden

if (sdata==null){

xmlHttp.open("GET",alink,true);
xmlHttp.send(null);

}else{

xmlHttp.open("POST",alink,true);
xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
xmlHttp.send(sdata);

}
}
}








      
    </script>
    
    
    
    
       <div id="info">

       </div>
    
    
    
    
   <div class="layers">
   

   
   <?php  $query = " SELECT * 
            FROM website_groups
            ORDER BY order_legend ASC";
            
   $result = @pg_query($GLOBALS['dbconn'],$query) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens = pg_fetch_array($result)) {
    	    echo '<div class="layertitle">'.$var_gegevens['name'].'</div>';
    	    
    	    
    	$query2 = " SELECT * 
            FROM website_layers
            WHERE group_id=".$var_gegevens['id']."
            ORDER BY order_legend ASC";
            
   $result2 = @pg_query($GLOBALS['dbconn'],$query2) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens2 = pg_fetch_array($result2)) {
    	    if ($var_gegevens2['visible']=='true'){$active="_active";}else{$active="";}
    	    echo '<a onclick="layer('.$var_gegevens2['id'].')" class="layer'.$active.'" id="l'.$var_gegevens2['id'].'">'.$var_gegevens2['name_legend'].'</a>';
  
    }    
	    
    }
    	    ?>  
   
   
   
      
    
   </div>
   
   
   <div class="legende_knop" onclick="toggle_legende()">
      Legende
   </div>
   
   <div class="legende" id="leg">
       <div class="legende_content">
   
      <?php   
      
   $query = " SELECT * 
            FROM website_groups
            ORDER BY order_legend ASC";
            
   $result = @pg_query($GLOBALS['dbconn'],$query) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens = pg_fetch_array($result)) {

      
      
      
      $query2 = " SELECT * 
            FROM website_layers
            WHERE group_id=".$var_gegevens['id']."
            ORDER BY order_legend ASC";
            
            $result2 = @pg_query($GLOBALS['dbconn'],$query2) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens2 = pg_fetch_array($result2)) {
    	    if ($var_gegevens2['visible']=='true'){$display="block";}else{$display="none";}
    	   echo '<div class="legende_item" id="legende_'.$var_gegevens2['id'].'" style="display:'.$display.'">'.$var_gegevens2['name_legend'].' <br> <img src="http://we12s007.ugent.be:8080/geoserver/search/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&STRICT=false&style=' .$var_gegevens2['style'].'"></div>
    ';
    
    }
    
    
    }
    
    
    
    
   
   ?>
   
   
     </div>
   </div>
   
   
   
  </body>
</html>

