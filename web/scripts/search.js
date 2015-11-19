
function initGeoSearch(layerObjects) {
    var layers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ];

    var layersById = [];

    for (var i = 0; i < layerObjects.length; ++i) {
        var tlayer = layerObjects[i];
        var image = new ol.layer.Image({
            extent: [250000, 6630000, 500000, 6770000],
            source: new ol.source.ImageWMS({
                url: 'http://we12s007.ugent.be:8080/geoserver/search/wms',
                params: {'LAYERS': tlayer.name},
                serverType: 'geoserver'
            }),
            visible: tlayer.visible
        });
        layers.push(image);
        layersById[tlayer.id] = image;
    }


    var archeologiepoly = new ol.layer.Image({
        title: 'artefacts',
        extent: [250000, 6630000, 500000, 6770000],
        source: new ol.source.ImageWMS({
            url: 'http://geo.vliz.be:80/geoserver/Scheldemonitor/wms',
            params: {'LAYERS': 'Scheldemonitor:archeologiepoly'},
            serverType: 'archeologiepoly'
        }),
        visible:true
    });





    layers.push(archeologiepoly);
    layersById[i+1] = archeologiepoly;

    var view = new ol.View({
       // projection: 'EPSG:4326',
        center: ol.proj.transform([2.70, 51.34], 'EPSG:4326', 'EPSG:3857'),
        zoom: 9
    });

    var map = new ol.Map({
        controls: [


            new ol.control.Zoom(),

            new ol.control.MousePosition({
                projection: 'EPSG:4326',
                coordinateFormat: ol.coordinate.createStringXY(4)
            }),


            //new ol.control.Attribution(),

            new ol.control.ZoomToExtent({
                extent: [
                    250000, 6630000,
                    500000, 6770000
                ]
            }),





            new ol.control.ScaleLine(),
            new ol.control.Rotate(),

          /*  new ol.control.OverviewMap(),  */


        ],
        layers: layers,
        target: 'map',
        view: view
    });



    //TODO: DEZE functie heeft weer wanneer een laag zichtbaar is en er dus getfeature info mag weergegeven worden

    function visible(nr) {
        return ! $('#l'+nr).hasClass('layer');
    }


    map.on('singleclick', function (evt) {
        var url = 'ajax/featureinfo?x=' + evt.coordinate[0] + '&y=' + evt.coordinate[1] + '&res=' + view.getResolution();
        var first = true;
        for (var i = 0; i < layerObjects.length; ++i) {
            var tlayer = layerObjects[i];
            if (first) {
                url += "?";
                first = false;
            } else {
                url += "&";
            }

            url += "l" + tlayer.id + '=' + //TODO: DEZE TRUE/FALSE zichtbaarheid dient aangepast te worden met behulp van JAVA BOLEAN

                visible(tlayer.id);

        }

        document.getElementById("info").style.display = "block";
        ajax(url, 'info', '', '', 'info-contents');

    });

    function layer() {
        var $this = $(this);
        var nr = $this.data('layer-id');
        layersById[nr].setVisible($this.hasClass("layer"));
        //bijvoorbeeld id legende_1 ==> toggleClass
        // (Add or remove one or more classes from each element in the set of matched elements,
        // depending on either the class's presence or the value of the state argument.)
        $('#legende_'+nr).toggleClass("display-none");
        //div this slaat op div layer <div>
        $this.toggleClass("layer_active");
        $this.toggleClass("layer");
    }

    $('.toggle-layer').click(layer);

    // TODO: generify
    $("#insert-link").click(function() {
        window.open('admin/insert','Popup', 'top=150px, left=400px width=500px, height=650px, status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');

    });

    $("#search-link").click(function() {
        window.open('admin/search','Popup', 'top=150px, left=400px width=500px, height=650px, status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');
    });


    $("#info-link").ready(function() {
        $('#Div3').hide();
    });


    $("#info-link").click(function() {
            $('#Div3').toggle();
    });


    $("#button_close").click(function() {
        $('#Div3').hide();
    });


    $("#depth-link").click(function() {
    });


    function toggle_legende() {
        $("#leg").toggleClass('display-none');
    }

    $('#legende_knop').click(toggle_legende);


    $('#close-info').click(function() {
        $("#info").css( "opacity", 0 );
    });


    function ajax(alink, aelementid, adata, aconfirm, contentelementid) {



        //bevestiging vragen indien nodig
        if (aconfirm) {
            var answer = confirm(aconfirm)
        }

        //uitvoeren indien bevestiging niet gevraagd of ok
        if (answer || aconfirm == "") {

            // ajax
            var xmlHttp;
            try {
                xmlHttp = new XMLHttpRequest();
            } catch (e) {
                try {
                    xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {
                        alert("Deze functie werkt niet op jouw computer, gelieve contact op te nemen met samuel.vanackere@ugent.be");
                        return false;
                    }
                }
            }
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4) {

                    // uitvoeren als pagina is opgeroepen.  xmlHttp.responseText is de inhoud van de opgeroepen pagina
                    document.getElementById(contentelementid).innerHTML = xmlHttp.responseText;
                    document.getElementById(aelementid).style.opacity = 1;

                }
            };


            // opbouwen postdata die moet worden meegezonden


            if (adata == '') {
                sdata = null;
            } else {


                sdata = '';
                arr_adata = adata.split(",");
                en = '';
                for (i in arr_adata) {
                    arr_data = arr_adata[i].split("@");


                    if (arr_data[0] == "t") {
                        waarde = document.getElementById(arr_data[1]).value;
                        waarde = waarde.replace(/&/g, "�");
                        sdata = sdata + en + arr_data[1] + '=' + waarde;
                    }
                    if (arr_data[0] == "c") {


                        sdata = sdata + en + arr_data[1] + '=' + document.getElementById(arr_data[1]).checked;
                    }
                    if (arr_data[0] == "r") {
                        radio_data = arr_data[1].split("#");
                        if (document.getElementById(arr_data[1]).checked) {
                            sdata = sdata + en + radio_data[0] + '=' + radio_data[1];
                        } else {
                            skip = true;
                        }
                    }
                    en = "&";
                }
            }


            //plaatsen loaderke
            document.getElementById(aelementid).style.opacity = 0.3;

            // pagina die opgeroepen moet worden

            if (sdata == null) {

                xmlHttp.open("GET", alink, true);
                xmlHttp.send(null);

            } else {

                xmlHttp.open("POST", alink, true);
                xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                xmlHttp.send(sdata);

            }
        }
    }
}

