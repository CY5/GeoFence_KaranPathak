

/*********************************Logic**************************************************/

function initialize()
{
    shap={};
    var map=new google.maps.Map(document.getElementById('googleMap'));
    map.setCenter(new google.maps.LatLng(indLat,indLong));
    map.setZoom(zoomLevel);
    return map;
}

function drawFence_circle(map)
{
   var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                google.maps.drawing.OverlayType.CIRCLE]
            },
            circleOptions: {
                fillColor: 'red',
                fillOpacity: 0.3,
                strokeWeight: 1,
                clickable: false,
                editable: true,
                zIndex: 1
            }
        });
        drawingManager.setMap(map);
        google.maps.event.addListener(drawingManager, 'circlecomplete', function(shape){
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;

        if (circle != null) {
            circle.setMap(null);
            circle = null;
        }
        console.log(shape);
        circle = shape;
        circle.type="circle";
        geometry_shape=circle;
        google.maps.event.addListener(geometry_shape,'center_changed',function(){
            marker.setMap(null);
            infowindow.close();
            getArea(geometry_shape.center,map);
        });
        google.maps.event.addListener(geometry_shape,'radius_changed',function(){
            var radius=convertMToKm(geometry_shape.radius);
            jQuery(".radius").val(radius);
        });
        var radius=convertMToKm(geometry_shape.radius);
        jQuery(".radius").val(radius);

        getArea(geometry_shape.center,map);
    });
}
function drawFence_rectangle(gmap){
  var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.RECTANGLE]
            },
            rectangleOptions: {
                fillColor: 'red',
                fillOpacity: 0.3,
                strokeWeight: 1,
                editable: true,
                zIndex: 1,
                draggable: true
            }
    });
    drawingManager.setMap(gmap);
    google.maps.event.addListener(drawingManager, 'rectanglecomplete',  function(shape){
            if (shape == null || (!(shape instanceof google.maps.Rectangle))) return;

            if (rectangle != null) {
                rectangle.setMap(null);
                rectangle = null;
            }

            rectangle = shape;
            rectangle.type="rectangle";
            geometry_shape=rectangle;
            google.maps.event.addListener(geometry_shape,'dragend',function(){
                marker.setMap(null);
                infowindow.close();
                getArea(geometry_shape.bounds.getCenter(),gmap);
            });
            getArea(geometry_shape.bounds.getCenter(),gmap);
    });
}
function drawFence_poly(map) 
{
  var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
                fillColor: 'red',
                fillOpacity: 0.3,
                strokeWeight: 1,
                editable: true,
                zIndex: 1,
                geodesic:true,
                draggable:true
            }
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(shape){
            if (shape == null || (!(shape instanceof google.maps.Polygon))) return;

            if (polygon != null) {
                polygon.setMap(null);
                polygon = null;
            }
            polygon = shape;
            polygon.type="polygon";
            geometry_shape=polygon;
               
    });
}

function  getArea(latlng,map){
    var geocoder;
    geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        
        marker = new google.maps.Marker({
            position: latlng,
            map: map
        });
        infowindow.setContent(results[1].formatted_address);
        jQuery(".address").val(results[1].formatted_address);
        infowindow.open(map, marker);
      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });
}
