
function initGeoSearch(layerObjects) {
    function setHTML(response) {
        console.log(response);
    }

    var layers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ];

    var depth_profile_layers = [];
    var depth_profile_images = [];

    var layersById = [];


    //TODO: dieptemodel enkel als TileWMS opvragen !!!
    for (var i = 0; i < layerObjects.length; ++i) {
        var tlayer = layerObjects[i];
        var image = new ol.source.TileWMS({
            url: 'http://we12s007.ugent.be:8080/geoserver/search/wms',
            params: {'LAYERS': tlayer.name},
            serverType: 'geoserver'
        });

        var tile = new ol.layer.Tile({
            extent: [240000, 6630000, 500000, 6780000],
            source: image,
            visible: tlayer.visible
        });
         if(tlayer.depth_profiling) {
             depth_profile_images.push(image);
             depth_profile_layers.push(tlayer);
         }

        layers.push(tile);
        layersById[tlayer.id] = tile;
    }


    //layers.push(archeologiepoly);
    //layersById[i+1] = archeologiepoly;

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

    var depth_profile_layer = function(start, end, image) {
        var viewResolution = /** @type {number} */ (view.getResolution());
        var steps = 40; //aantal onderverdeling
        var diff = [
            (end[0] - start[0])/steps,
            (end[1] - start[1])/steps
        ];
        var depth_at_points = [];
        var threads = [];
        for(var i = 0; i < steps; ++i) {
            var point = [
                start[0] + i*diff[0],
                start[1] + i*diff[1]
            ];
            var url = image.getGetFeatureInfoUrl(
                point, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'text/html'});
            if (url) {
                threads.push($.get('http://localhost/cgi-bin/proxy.cgi',
                    {
                        url: url
                    },
                    (function(k) {
                        /*
                         * We need two functions here because the inner function gets evaluated
                         * after the AJAX request is complete, but at this time i has long been changed.
                         *
                         * O the joys of multithreading.
                         */
                        return function (result) {

                            depth_at_points[k] = parseFloat($($(result).find("td")[1]).text());
                        };
                    })(i)
                ));
            }
        }

        // Wait for all AJAX calls to return
        $.when.apply($, threads).done(function() {
            drawCurve("#depthsvg",depth_at_points );
        });

    };

    var firstCoordinates = null;
    var enable_depth_profiling = false;
    var enable_info = false;


    //Dieptepunt
    function depthpoint_profiling(evt) {
        for(var i = 0; i < depth_profile_layers.length; ++i) {
            var tile = depth_profile_layers[i];
            var image = depth_profile_images[i];
            var viewResolution = /** @type {number} */ (view.getResolution());
            console.log(evt.coordinate);
            var url = image.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'text/html'});
            if (url) {
                $.get('http://localhost/cgi-bin/proxy.cgi', {
                    url: url
                }, function(result) {
                    $("#info-depth").text($($(result).find("td")[1]).text());
                    console.log(parseFloat($($(result).find("td")[1]).text()));

                    
                });
            }
        }
    }


    var depth_profiling = function(evt) {
        if(firstCoordinates == null) {
            resetFeatures();
            firstCoordinates = evt.coordinate;
        } else {
            draw.finishDrawing();
            for (var i = 0; i < depth_profile_images.length; ++i) {
                if(! visible(depth_profile_layers[i].id)) {
                    continue;
                }
                var image = depth_profile_images[i];
                depth_profile_layer(firstCoordinates, evt.coordinate, image);
                $('#Div3').show();
            }
            firstCoordinates = null;
        }
    };



    //Use escape button
    $(document).keyup(function(e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            // <DO YOUR WORK HERE>
            resetFeatures();
            $("#info").css( "opacity", 0 );
        }
    });


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

                url += "l" + tlayer.id + '=' +  //TODO: DEZE TRUE/FALSE zichtbaarheid dient aangepast te worden met behulp van JAVA BOLEAN

                    visible(tlayer.id);

            }
            if (enable_info) {
                        document.getElementById("info").style.display = "block";
                        ajax(url, 'info', '', '', 'info-contents');
                        depthpoint_profiling(evt);
                    }
            //wanneer knop is aangeklikt TODO: DIENT ZELFDE ALS INFO
            if (enable_depth_profiling)
                depth_profiling(evt);


        });


    var draw = null; // global so we can remove it later
    var featureOverlay = null;
    var resetFeatures = function() {
        if(featureOverlay != null)
            featureOverlay.getFeatures().clear();
    };
    featureOverlay = new ol.FeatureOverlay({
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });
    map.addOverlay(featureOverlay);

    var changeInteraction = function(type) {
        resetFeatures();

        removeInteraction();
        draw = new ol.interaction.Draw({
            features: featureOverlay.getFeatures(),
            type: /** @type {ol.geom.GeometryType} */ type
        });
        map.addInteraction(draw);
    };

    var removeInteraction = function() {
        enable_depth_profiling = false;
        enable_info = false;
        if(draw != null) {
            map.removeInteraction(draw);
        }
        draw = null;

    };

    $('#polygon-link').click(function(){
        if($(this).hasClass("selected-drawer")) {
            resetFeatures();
            removeInteraction();
        } else {
            changeInteraction('Polygon');
        }
        $(this).toggleClass("selected-drawer")
    });


    $('#info-link').click(function(){
        if($(this).hasClass("selected-drawer")) {
            resetFeatures();
            removeInteraction();
        } else {
            enable_info = true;
        }
        $(this).toggleClass("selected-drawer")
    });




    $('#depth-link').click(function(){
        if($(this).hasClass("selected-drawer")) {
            resetFeatures();
            removeInteraction();
        } else {
            changeInteraction('LineString');
            enable_depth_profiling = true;
                    }
        $(this).toggleClass("selected-drawer")
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


    $(document).ready(function() {
        $('#Div3').hide();
    });




    $("#button_close").click(function() {
        $('#Div3').hide();
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

