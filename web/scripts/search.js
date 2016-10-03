function initGeoSearch(layerObjects) {
    var layers = [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ];

    var depth_profile_layers = [];
    var depth_profile_images = [];
    var timeline_layers = [];

    var layersById = [];

    // $(document).ready(function() {
    $('#depth-profile').hide();
    $('#depthpoint_box').hide();
    //});

    //TODO: dieptemodel enkel als TileWMS opvragen !!!
    for (var i = 0; i < layerObjects.length; ++i) {
        var tlayer = layerObjects[i];
        var image = new ol.source.TileWMS({
            url: '//crest.ugent.be/geoserver/search/wms',//search
            params: {
                LAYERS: tlayer.name,
                TIME: buildTIMEParameter(150000, 1)
            },
            serverType: 'geoserver',
            crossOrigin: true
        });

        var tile = new ol.layer.Tile({
            extent: [200000, 6550000, 670000, 6780000], //6630000 500000 6780000
            source: image,
            visible: tlayer.visible
        });
        if (tlayer.depth_profiling) {
            depth_profile_images.push(image);
            depth_profile_layers.push(tlayer);
        }

        if(tlayer.timeline) {
            timeline_layers.push(tlayer);
        }

        layers.push(tile);
        layersById[tlayer.id] = tile;
    }

    var changedTime = false;

    setInterval(function () {
        if(changedTime) {
            changedTime = false;
            var period = brush.extent();
            for (var i = 1; i < layers.length; ++i) {
                layers[i].getSource().updateParams({
                    TIME: buildTIMEParameter(period[1], period[0])
                });
            }
        }
    }, 1000);

    function buildTIMEParameter(start, end) {
        const TIME_TRANSLATION = 0;
        return (transform(Math.round(start)) + TIME_TRANSLATION)+"/"+ (transform(Math.round(end))+TIME_TRANSLATION);
    }

    var margin = {top: 10, right: 10, bottom: 40, left: 40},
        width = 960 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    var x = d3.scale.log().range([0, width]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function (d) {
            return x.tickFormat(20, d3.format(",d"))(transform(d))
        })
        .tickValues([-150000, -100000, -10000, -1000, 0, 1000, 2000, new Date().getFullYear()].map(reverse_transform));

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brushed);

    var svg = d3.select("svg#timeline")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([150000, 1]);

    var periods_pane = context.append("g")
        .attr("class", "timeperiods");

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "1em")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-90)" );

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7);

    var periods = {
        'Nieuwste tijd': {
            start: 1789,
            end: new Date().getFullYear(),
            class: 'nieuwste-tijd'
        },
        'Nieuwe tijd': {
            end: 1789,
            start: 1500,
            class: 'nieuwe-tijd'
        },
        Middeleeuwen: {
            start: 476,
            end: 1500,
            class: 'middeleeuwen'
        },
        'Romeinse tijd': {
            start: -57,
            end: 476,
            class: 'romeinse-tijd'
        },
        Ijzertijd: {
            start: -800,
            end: -57,
            class: 'ijzertijd'
        },
        Bronstijd: {
            start: -2000,
            end: -800,
            class: 'bronstijd'
        },
        'Einde Neolithicum': {
            start: -3000,
            end: -2000,
            class: 'einde-neolithicum'
        },
        'Begin Neolithicum': {
            start: -9000,
            end: -3000,
            class: 'begin-neolithicum'
        },
        Paleolithicum: {
            start: -150000,
            end: -9000,
            class: 'paleolithicum'
        }
    };

    for( var key in periods ) {
        periods_pane.append('rect')
            .attr("x", x(transform(periods[key].start)))
            .attr("y", 0)
            .attr("height", 50)
            .attr("width", x(transform(periods[key].end)) - x(transform(periods[key].start)))
            .attr("class", periods[key].class);
    }

    function brushed() {
        changedTime = true;
    }

    function transform(number) {
        return new Date().getFullYear() + 1 - number;
    }

    function reverse_transform(year) {
        return -(year - 1 - new Date().getFullYear());
    }

    //layers.push(archeologiepoly);
    //layersById[i+1] = archeologiepoly;

    var view = new ol.View({
        // projection: 'EPSG:4326',
        center: ol.proj.transform([2.70, 51.34], 'EPSG:4326', 'EPSG:3857'),
        zoom: 9
    });

    window.focusTo = function focusTo(x, y, layer) {
        view.setCenter(ol.proj.fromLonLat([x, y]));
        view.setZoom(10);

        var $layer = $("#l"+layer);
        if(! $layer.hasClass("layer_active")) {
            $layer.click();
        }

        $('#search-link').removeClass("selected-drawer");
    };

    var map = new ol.Map({
        controls: [

            new ol.control.Zoom(),
            new ol.control.MousePosition({
                projection: 'EPSG:4326',
                coordinateFormat: ol.coordinate.createStringXY(4)
            }),
            new ol.control.ZoomToExtent({
                className: 'first-extent',
                label: 'A',
                extent: [
                    315888, 6656592,
                    316710, 6657414
                ]
            }),
            new ol.control.ZoomToExtent({
                className: 'second-extent',
                label: 'B',
                extent: [
                    315492, 6656313,
                    316250, 6657097
                ]
            }),
            new ol.control.ZoomToExtent({
                className: 'third-extent',
                label: 'C',
                extent: [
                    315047, 6655992,
                    315824, 6656799
                ]
            }),
            new ol.control.ZoomToExtent({
                className: 'fourth-extent',
                label: 'D',
                extent: [
                    314606, 6655702,
                    315386, 6656501
                ]
            }), new ol.control.ZoomToExtent({
                className: 'fifth-extent',
                label: 'E',
                extent: [
                    314157, 6655415,
                    314975, 6656192
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
        return $('#l' + nr).hasClass('layer_active');
    }

    var depth_profile_layer = function (start, end, images) {
        var viewResolution = /** @type {number} */ (view.getResolution());
        var steps = 40; //aantal onderverdeling
        var diff = [
            (end[0] - start[0]) / steps,
            (end[1] - start[1]) / steps
        ];

        console.log(diff);
        var depth_at_points = [];
        var threads = [];
        for(var j = 0; j < images.length; ++j) {
            var image = images[j];
            var curve = [];
            for (var i = 0; i < steps; ++i) {
                var point = [
                    start[0] + i * diff[0],
                    start[1] + i * diff[1]
                ];
                var url = image.getGetFeatureInfoUrl(
                    point, viewResolution, 'EPSG:3857',
                    {'INFO_FORMAT': 'text/html'});
                if (url) {
                    threads.push($.get('/cgi-bin/proxy.cgi',
                        {
                            url: url
                        },
                        (function (k, c) {
                            /*
                             * We need two functions here because the inner function gets evaluated
                             * after the AJAX request is complete, but at this time i has long been changed.
                             *
                             * O the joys of multithreading.
                             */
                            return function (result) {
                                c[k] = parseFloat($($(result).find("td")[1]).text());
                            };
                        })(i, curve)
                    ));
                }
            }

            depth_at_points.push(curve);
        }

        // Wait for all AJAX calls to return
        $.when.apply($, threads).done(function () {
            $("#depth-profile").find(".spinner").hide();
            $("#depthsvg").show();
            drawCurve("#depthsvg", depth_at_points);
        });

    };

    var firstCoordinates = null;
    var enable_depth_profiling = false;
    var enable_info = false;
    var enable_depthpoint = false;
    var enable_measuring = false;
    var enable_output = false;
    var outputnumber = '1';

    //Dieptepunt
    function depthpoint_profiling(evt) {
        for (var i = 0; i < depth_profile_layers.length; ++i) {
            var tile = depth_profile_layers[i];
            if(! visible(tile.id)) continue;

                var image = depth_profile_images[i];
            var viewResolution = /** @type {number} */ (view.getResolution());
            //console.log(evt.coordinate);
            var url = image.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:3857',
                {'INFO_FORMAT': 'text/html'});
            if (url) {
                $.get('/cgi-bin/proxy.cgi', {
                    url: url
                }, function (result) {
                    $("#info-depth").text($($(result).find("td")[1]).text());
                    var depth = console.log(parseFloat($($(result).find("td")[1]).text()));

                });
            }
        }
    }

    var depth_profiling = function (evt) {
        if (firstCoordinates === null) {
            resetFeatures();
            firstCoordinates = evt.coordinate;
        } else {
            draw.finishDrawing();
            var images = [];
            for (var i = 0; i < depth_profile_images.length; ++i) {
                if (!visible(depth_profile_layers[i].id)) {
                    continue;
                }
                var image = depth_profile_images[i];
                images.push(image);
                $('#depth-profile').show();
                $("#depthsvg").hide();
                $("#depth-profile").find(".spinner").show();
            }
            if (!images.length == 0) {
                alert('There is no active layer with depth info.');
            } else {
                depth_profile_layer(firstCoordinates, evt.coordinate, images);
            }
            firstCoordinates = null;
        }
    };

    //Use escape button
    $(document).keyup(function (e) {
        if (e.keyCode == 27) { // escape key maps to keycode `27`
            // <DO YOUR WORK HERE>
            resetFeatures();
            $("#info").css("opacity", 0);
        }
    });

    function layerVisibility() {
        var map = {};
        for (var i = 0; i < layerObjects.length; ++i) {
            var tlayer = layerObjects[i];
            if (visible(tlayer.id)) {
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

    function mapFormatLength(projection, coordinates) {
        var length;
        length = 0;
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], projection, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], projection, 'EPSG:4326');
            length += (new ol.Sphere(6378137)).haversineDistance(c1, c2);
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    }

    function measure(evt) {
        if (firstCoordinates === null) {
            resetFeatures();
            firstCoordinates = [evt.coordinate];
        } else {
            draw.finishDrawing();
            firstCoordinates.push(evt.coordinate);
            alert("The distance between theses points is: "
                + mapFormatLength('EPSG:3857', firstCoordinates)
                + ".");
            firstCoordinates = null;
        }
    }

    map.on('singleclick', function (evt) {
        var params = layerVisibility();
        params.x = evt.coordinate[0];
        params.y = evt.coordinate[1];
        params.res = view.getResolution();

        if (enable_info) {
            $.get('ajax/featureinfo', params, showNodesInfo);
        }

        if (enable_depthpoint) {
            $.get('ajax/featureinfo', params, function (response) {
                $('#depth-contents').html(response);
                $('#depthpoint_box').show();
            });
            depthpoint_profiling(evt);
        }
        //wanneer knop is aangeklikt TODO: DIENT ZELFDE ALS INFO
        if (enable_depth_profiling)
            depth_profiling(evt);

        if (enable_measuring) {
            measure(evt);
        }

        if (enable_output) {

            $.get('ajax/closest', params, function (response) {
                window.open('admin/node/' + response,
                    'Popup', 'width=' + screen.width + ', height=' + screen.height + ', status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');
            });
        }
    });


    var draw = null; // global so we can remove it later
    var featureOverlay = null;
    var resetFeatures = function () {
        if (featureOverlay != null)
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

    var changeInteraction = function (type) {
        resetFeatures();

        removeInteraction();
        draw = new ol.interaction.Draw({
            features: featureOverlay.getFeatures(),
            type: /** @type {ol.geom.GeometryType} */ type
        });
        map.addInteraction(draw);
        if (type === 'Polygon') {
            draw.on('drawstart', resetFeatures);
            draw.on('drawend', function (event) {
                var params = layerVisibility();
                params.points = event.feature.getGeometry().getCoordinates()[0];

                $.get('ajax/polygon', params, showNodesInfo);
            })
        }
    };

    var removeInteraction = function () {
        enable_depth_profiling = false;
        enable_info = false;
        enable_depthpoint = false;
        enable_output = false;
        enable_measuring = false;
        $("#depthpoint_box").css("opacity", 0);
        if (draw != null) {
            map.removeInteraction(draw);
        }
        draw = null;

    };

    $("ul.nav li").click(function () { // Part I
        resetFeatures();
        removeInteraction();
    });

    $("#fblink").attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));

    $('#polygon-link').click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            changeInteraction('Polygon');
        }
    });

    $('#info-link').click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            enable_info = true;
        }
    });

    $("#measure-link").click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            changeInteraction('LineString');
            enable_measuring = true;
        }
    });

    $('#output').click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            enable_output = true;
        }
    });

    $('#depthpoint-link').click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            enable_depthpoint = true;
        }
    });

    $('#depth-link').click(function () {
        if (!$(this).hasClass("selected-drawer")) {
            changeInteraction('LineString');
            enable_depth_profiling = true;
        }
    });

    $("ul.nav li").click(function () { // Part II
        var hasClass = $(this).hasClass("selected-drawer");
        $(".selected-drawer").removeClass("selected-drawer");
        if (!hasClass)
            $(this).addClass("selected-drawer");
    });

    $(".categorytitle").click(function () {
        var category = $(this).data("category");
        var hasActive = false;
        var hasInactive = false;
        var layers = $(".toggle-layer").filter(function() {
            return $(this).data("category") == category;
        });
        layers.each(function() {
            if($(this).hasClass('layer_active')) {
                hasActive = true;
            } else {
                hasInactive = true;
            }
        });

        if(hasActive && hasInactive) {
            layers.each(function () {
                if(! $(this).hasClass('layer_active'))
                    $(this).click();
            });
        } else {
            layers.each(function () {
                $(this).click();
            });
        }
    });

    //TODO: DOWNLOAD
    var exportPNGElement = document.getElementById('download-link');
    exportPNGElement.addEventListener('click', function (e) {
        map.once('postcompose', function (event) {
            var canvas = event.context.canvas;
            exportPNGElement.href = canvas.toDataURL('image/png');
            var link = $(exportPNGElement).find('a');
            link.attr('href', canvas.toDataURL('image/png'));

            console.log(canvas.toDataURL('image/png'));
        });
        map.renderSync();
    }, true);

    //TODO: Measuring !!
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        // Distance in km
        return R * c;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    var layer_panel = $('.layer-panel');
    layer_panel.hide();
    layer_panel.click(function () {
        $('.layer-panel').hide();
    });

    function layer() {
        var $this = $(this);
        var nr = $this.data('layer-id');
        var reference = $this.data('reference');
        var info = $this.data('layer-info');
        if (reference.length > 0 && !$this.hasClass("layer_active")) {
            $('.layer-panel').show();
            $('#reference-content').text(reference);
            $('#layer-info-content').text(info);
        } else {
            $('.layer-panel').hide();
        }
        layersById[nr].setVisible(!$this.hasClass("layer_active"));
        //bijvoorbeeld id legende_1 ==> toggleClass
        // (Add or remove one or more classes from each element in the set of matched elements,
        // depending on either the class's presence or the value of the state argument.)
        $('#legende_' + nr).toggleClass("display-none");
        //div this slaat op div layer <div>
        $this.toggleClass("layer_active");
        set_timeline();
    }

    function set_timeline() {
        var $timeline = $('#timeline');
        var $timeline_legend = $('#timeline-legende');
        for(var i = 0; i < timeline_layers.length; ++i) {
            if (visible(timeline_layers[i].id)) {
                return $timeline.show() && $timeline_legend.show();
            }
        }

        $timeline.hide();
        $timeline_legend.hide();
    }

    $('.toggle-layer').click(layer);

    // TODO: generify
    $("#insert-link").click(function () {
        window.open('admin/insert', 'Popup', 'top=150px, left=400px width=500px, height=650px, status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');

    });

    $("#search-link").click(function () {
        window.open('admin/search', 'Popup', 'width=' + screen.width + ',height=' + screen.height + ',status=no, location=no, titlebar=no, toolbar=yes,menubar=no, scrollbars=yes');
    });

    $("#button_close").click(function () {
        $('#depth-profile').hide();
    });


    function toggle_legende() {
        $("#leg").toggleClass('display-none');
    }

    $('#legende_knop').click(toggle_legende);

    $('#close-info').click(function () {
        $("#info").hide()
    });

    set_timeline();
}
