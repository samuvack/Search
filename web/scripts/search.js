

function initGeoSearch(layerObjects) {
    var layers = [
            new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ];

    var depth_profile_layers = [];
    var depth_profile_images = [];

    var layersById = [];



    // $(document).ready(function() {
    $('#depth-profile').hide();
    $('#depthpoint_box').hide();
    //});


    //TODO: dieptemodel enkel als TileWMS opvragen !!!
    for (var i = 0; i < layerObjects.length; ++i) {
        var tlayer = layerObjects[i];
        var image = new ol.source.TileWMS({
            url: 'http://we12s007.ugent.be:8080/geoserver/search/wms',//search
            params: {'LAYERS': tlayer.name},
            serverType: 'geoserver',
            crossOrigin: true
        });

        var tile = new ol.layer.Tile({
            extent: [200000, 6550000, 670000, 6780000], //6630000 500000 6780000
            source: image,
            visible:tlayer.visible
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




    /*
     //create 3d globe view
     var ol3d = new olcs.OLCesium({
     map: map,
     target: '3dmap'
     });
     /*commented terrainprovider since problem with displaying features
     var scene = ol3d.getCesiumScene();
     var terrainProvider = new Cesium.CesiumTerrainProvider({
     url: '//cesiumjs.org/stk-terrain/tilesets/world/tiles'
     });
     scene.terrainProvider = terrainProvider;*/
    // console.log(ol3d.setEnabled(false));


    //TODO: DEZE functie geeft weer wanneer een laag zichtbaar is en er dus getfeature info mag weergegeven worden

    function visible(nr) {
        return $('#l'+nr).hasClass('layer_active');
    }

    var depth_profile_layer = function(start, end, image) {
        var viewResolution = /** @type {number} */ (view.getResolution());
        var steps = 40; //aantal onderverdeling
        var diff = [
            (end[0] - start[0])/steps,
            (end[1] - start[1])/steps
        ];

        console.log(diff);
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
                threads.push($.get('/cgi-bin/proxy.cgi',
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
            $("#depth-profile").find(".spinner").hide();
            $("#depthsvg").show();
            drawCurve("#depthsvg",depth_at_points);
        });

    };

    var firstCoordinates = null;
    var enable_depth_profiling = false;
    var enable_info = false;
    var enable_depthpoint = false;
    var enable_output=false;
    var outputnumber = '1';



    //Dieptepunt
    function depthpoint_profiling(evt) {
        for(var i = 0; i < depth_profile_layers.length; ++i) {
            var tile = depth_profile_layers[i];
            var image = depth_profile_images[i];
            var viewResolution = /** @type {number} */ (view.getResolution());
            //console.log(evt.coordinate);
            var url = image.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'text/html'});
            if (url) {
                $.get('/cgi-bin/proxy.cgi', {
                    url: url
                }, function(result) {
                    $("#info-depth").text($($(result).find("td")[1]).text());
                    var depth = console.log(parseFloat($($(result).find("td")[1]).text()));

                });
            }
        }
    }

    var depth_profiling = function(evt) {
        if(firstCoordinates === null) {
            resetFeatures();
            firstCoordinates = evt.coordinate;
        } else {
            var found = false;
            draw.finishDrawing();
            for (var i = 0; i < depth_profile_images.length; ++i) {
                if(! visible(depth_profile_layers[i].id)) {
                    continue;
                }
                var image = depth_profile_images[i];
                depth_profile_layer(firstCoordinates, evt.coordinate, image);
                $('#depth-profile').show();
                $("#depthsvg").hide();
                $("#depth-profile").find(".spinner").show();

                found = true;
            }
            firstCoordinates = null;
            if(!found)
                alert('There is no active layer with depth info.');
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

    function layerVisibility() {
        var map = {};
        for (var i = 0; i < layerObjects.length; ++i) {
            var tlayer = layerObjects[i];
            if(visible(tlayer.id)) {
                map['l' + tlayer.id] = visible(tlayer.id);
            }
            outputnumber = tlayer.id;
        }
        return map;
    }

    function showNodesInfo(response) {
        $('#info-contents').html(response);
        $('#info').show();
    }

    map.on('singleclick', function (evt) {
        var params = layerVisibility();
        params.x = evt.coordinate[0];
        params.y = evt.coordinate[1];
        params.res =  view.getResolution();

        if (enable_info) {
            $.get('ajax/featureinfo', params, showNodesInfo);
        }

        if(enable_depthpoint) {
            $.get('ajax/featureinfo', params, function(response) {
                $('#depth-contents').html(response);
                $('#depthpoint_box').show();
            });
            depthpoint_profiling(evt);
        }
        //wanneer knop is aangeklikt TODO: DIENT ZELFDE ALS INFO
        if (enable_depth_profiling)
            depth_profiling(evt);

        if(enable_output) {

            $.get('ajax/closest', params, function(response) {
                window.open('admin/node/'+ response,
                    'Popup', 'width=' + screen.width + ', height=' + screen.height + ', status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');
            });
        }
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
        if(type === 'Polygon') {
            draw.on('drawend', function(event) {
                var params = layerVisibility();
                params.points = event.feature.getGeometry().getCoordinates()[0];

                $.get('ajax/polygon', params, showNodesInfo);
            })
        }
    };

    var removeInteraction = function() {
        enable_depth_profiling = false;
        enable_info = false;
        enable_depthpoint = false;
        //enable_output=false;
        $("#depthpoint_box").css( "opacity", 0 );
        if(draw != null) {
            map.removeInteraction(draw);
        }
        draw = null;

    };

    $("ul.nav li").click(function() { // Part I
        resetFeatures();
        removeInteraction();
    });

    $("#fblink").attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));

    $('#polygon-link').click(function(){
        if(! $(this).hasClass("selected-drawer")) {
            changeInteraction('Polygon');
        }
    });

    $('#info-link').click(function(){
        if(! $(this).hasClass("selected-drawer")) {
            enable_info = true;
        }
    });

    $('#output').click(function(){
        if(! $(this).hasClass("selected-drawer")) {
            enable_output = true;
        }
    });

    $('#depthpoint-link').click(function(){
        if(! $(this).hasClass("selected-drawer")) {
            enable_depthpoint = true;
        }
    });

    $('#depth-link').click(function(){
        if(! $(this).hasClass("selected-drawer")) {
            changeInteraction('LineString');
            enable_depth_profiling = true;
        }
    });

    $("ul.nav li").click(function() { // Part II
        $(".selected-drawer").removeClass("selected-drawer");
        $(this).addClass("selected-drawer");
    });

    //TODO: DOWNLOAD
    var exportPNGElement = document.getElementById('download-link');


        exportPNGElement.addEventListener('click', function(e) {
            map.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                exportPNGElement.href = canvas.toDataURL('image/png');
                var link = $(exportPNGElement).find('a');
                link.attr('href', canvas.toDataURL('image/png'));

                console.log(canvas.toDataURL('image/png'));
            });
            map.renderSync();
        }, true);



    //TODO: Measuring !!
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c; // Distance in km
        return distance;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function layer() {
        var $this = $(this);
        var nr = $this.data('layer-id');
        layersById[nr].setVisible(!$this.hasClass("layer_active"));
        //bijvoorbeeld id legende_1 ==> toggleClass
        // (Add or remove one or more classes from each element in the set of matched elements,
        // depending on either the class's presence or the value of the state argument.)
        $('#legende_'+nr).toggleClass("display-none");
        //div this slaat op div layer <div>
        $this.toggleClass("layer_active");
    }

    $('.toggle-layer').click(layer);

    // TODO: generify
    $("#insert-link").click(function() {
        window.open('admin/insert','Popup', 'top=150px, left=400px width=500px, height=650px, status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');

    });

    $("#search-link").click(function() {
        window.open('admin/search','Popup', 'width=' + screen.width + ',height='+ screen.height + ',status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');
    });

    $("#button_close").click(function() {
        $('#depth-profile').hide();
    });


    function toggle_legende() {
        $("#leg").toggleClass('display-none');
    }

    $('#legende_knop').click(toggle_legende);

    $('#close-info').click(function() {
        $("#info").hide()
    });

}

