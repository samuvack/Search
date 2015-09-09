<?php
include('../include/db.inc.php');




   $query = " SELECT * 
            FROM website_groups
            ORDER BY order_legend ASC";
            
   $result = @pg_query($GLOBALS['dbconn'],$query) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens = pg_fetch_array($result)) {

      
      
      
      $query2 = " SELECT * 
            FROM website_layers
            WHERE group_id=".$var_gegevens['id']."
              AND feature_info = 'true'
            ORDER BY order_legend ASC";
            
            $result2 = @pg_query($GLOBALS['dbconn'],$query2) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens2 = pg_fetch_array($result2)) {
    	    if ($_GET['l'.$var_gegevens2['id']]=='true')
    	    	    {$display="block";
  echo "<div class='infotitle'>".$var_gegevens2['name_legend']."</div>";


      
      $query3 = " SELECT * 
            FROM ".$var_gegevens2['db_table']."
            WHERE st_intersects(st_transform(geom,3857),st_buffer(st_setsrid(st_point(".$_GET['x'].",".$_GET['y']."),3857),".($_GET['res']*10)."))";
            
            $result3 = @pg_query($GLOBALS['dbconn'],$query3) or die ("error: ".pg_last_error($GLOBALS['dbconn'])); 

    while($var_gegevens3 = pg_fetch_array($result3)) {
    	    

    	    
if ($var_gegevens2['id']<7){	    
echo "<div class='infoobject'><div class='infoname'>".$var_gegevens3['name']."</div>";   
echo "<div class='infopar'><b>Subtype:</b> ".$var_gegevens3['subtype_nl']."</div>";   
echo "<div class='infopar'><b>Materiaal:</b> ".$var_gegevens3['material_nl']."</div>";   
echo "<div class='infopar'><b>Lengte (cm):</b> ".$var_gegevens3['length']."</div>";   
echo "<div class='infopar'><b>Breedte (cm):</b> ".$var_gegevens3['width']."</div>";   
echo "<div class='infopar'><b>Hoogte (cm):</b> ".$var_gegevens3['heigth(thickness)']."</div>";   
echo "<div class='infopar'><b>Samenvatting:</b> ".$var_gegevens3['summary_nl']."</div>";

if (trim($var_gegevens3['supplements'])!=''){
echo "<div class='infopar'><a href='".$var_gegevens3['supplements']."' target='_blank'>Bijlage</a> </div>";   
}
echo "</div>"; 

}


    		    }
    


}}


    
    }

