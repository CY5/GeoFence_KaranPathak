fitx.utils.require(['fitx', 'page2', 'newGeoFenceForm']);

/***************************Global variable***************************************/
var indLat=21.0000;
var indLong=78.0000;
var zoomLevel=5;
var circle;
var polygon;
var rectangle;
var geometry_shape=new Array();
var marker=new google.maps.Marker;
var infowindow = new google.maps.InfoWindow();   
jQuery(window).load(function () {

    /********************************declaration********************************************/
    var flag=0;
    var circle=jQuery('.gn-icon-circle');
    var poly=jQuery('.gn-icon-polygon');
    var circle_clickListener,poly_clickListener;
    addToTable();
    getvehiclename();
    initialize();
    /*********************************event Handle**************************************************/
    location.hash='';
    jQuery('.car >option').val(function (i, value) {
        return value.trim();
    });
    jQuery('.gn-icon-update').css({'pointer-events': 'none'});
    jQuery('.gn-icon-save').css({'pointer-events': 'auto'});
    jQuery('.li_add').css({'display':'none'});
    jQuery('.li_radius').css({'display':'none'});
    jQuery('.radius').bind('keyup', function () {
        var radius=jQuery(this).val();
        try{
            geometry_shape.setRadius(radius*1000);
        }
        catch(err){
            alert("Geometry shape undefined");
        }
        console.log(radius);
    });
    jQuery('.gn-icon-circle').bind('click',function(){
        jQuery('.shape').val('CIRCLE');
        jQuery('.address').val('');
        jQuery('.radius').val('');
        jQuery('.li_add').css({'display':'block'});
        jQuery('.li_radius').css({'display':'block'});
        var map=initialize();
        drawFence_circle(map);

    });
    jQuery('.gn-icon-polygon').bind('click',function(){
        jQuery('.shape').val('POLYGON');
        jQuery('.li_add').css({'display':'none'});
        jQuery('.li_radius').css({'display':'none'});
        var map=initialize();
        drawFence_poly(map); 
    });
    jQuery('.gn-icon-rectangle').bind('click',function(){
        jQuery('.shape').val('RECTANGLE');
        jQuery('.li_radius').css({'display':'none'});
        jQuery('.li_add').css({'display':'block'});
        jQuery('.address').val('');
        var map=initialize();
        drawFence_rectangle(map);
    });
    jQuery('.switch').bind('click',function(){
        if(flag){
            jQuery('.switch').text(">>");
            flag=0;
        }
        else{
            jQuery('.switch').text("<<");
            flag=1;
        }
        jQuery('.sidebar').toggleClass('open');
    });
    jQuery('a.fence_data').bind('click',function(){
           jQuery('.gn-icon-update').css({'pointer-events': 'auto'});
           jQuery('.gn-icon-save').css({'pointer-events': 'none'});
           jQuery('.gn-fence').val(jQuery(this).text());
           var row = jQuery(this).closest("tr");    // Find the row
           var type = row.find(".type").text().trim(); // Find the text
           var geometry=row.find(".geometry").text();
           var text=jQuery(this).data("geomet");
           var fid=row.find(".delete").data("geofid");
           var v_id=row.find(".vid").text().trim();
           v_id=v_id.split(',');
           jQuery('.cars').val(v_id);
           jQuery('.gn-fId').val(fid);
           var map=initialize();
           geometry_shape = IO.OUT(text, map);
           console.log(type);
           if(type==="CIRCLE"){
             jQuery('.li_add').css({'display':'block'});
            jQuery('.li_radius').css({'display':'block'});
            var radius=row.find(".radius").text();
            radius=radius/1000;
            jQuery('.radius').val(radius);
            jQuery('.address').val(getArea(geometry_shape.center,map));
           }
           else if(type==="RECTANGLE"){
            jQuery('.li_add').css({'display':'block'});
            jQuery('.li_radius').css({'display':'none'});
                jQuery('.address').val(getArea(geometry_shape.bounds.getCenter(),map));
           }
           else if(type==="POLYGON"){
                jQuery('.li_radius').css({'display':'none'});
                jQuery('.li_add').css({'display':'none'});
           }
           jQuery('.shape').val(type);
    });
    jQuery('.gn-icon.gn-icon-save').bind('click',function(){
        jQuery('#GeoForm').submit();
        document.getElementById("GeoForm").reset();
        initialize();
    });
    jQuery('#GeoForm').submit(function(event){
        event.preventDefault();
            var data={};
            var select_arr=[];
            var dt = IO.IN(geometry_shape, false);
            jQuery(".cars option:selected").each(function() {
                var str=jQuery(this).val();
                str=str.trim();
                select_arr.push(str);
            });
            data['vehicleId']=select_arr.toString();
            data['fenceName']=jQuery('.gn-fence').val();
            data['Details']=JSON.stringify(dt);
            sendAjaxRequest('newGeoFenceFormAction',data,successdata);
    });
    jQuery('.gn-icon.gn-icon-cancel').bind('click',function(){
        document.getElementById("GeoForm").reset();
        initialize();
        jQuery('.gn-icon-save').css({'pointer-events': 'auto'});
    });
    jQuery('td.gn-icon.delete').bind('click',function(event){
        var data={};
        data['fenceId'] = jQuery(this).data('geofid');
        jQuery('.dataTable > tbody').html("");
        //event.preventDefault();
         fnOpenNormalDialog(data);
        

    });
    jQuery('.gn-icon-update').bind('click',function(){
            var data={};
            var select_arr=[];
            var dt = IO.IN(geometry_shape, false);
            jQuery(".cars option:selected").each(function() {
                var str=jQuery(this).val();
                str=str.trim();
                select_arr.push(str);
            });
            data['fenceID']=jQuery('.gn-fId').val();
            console.log(data['fenceId']);
            data['vehicleId']=select_arr.toString();
            data['fenceName']=jQuery('.gn-fence').val();
            data['Details']=JSON.stringify(dt);
            sendAjaxRequest('newGeoVehicle_updateData',data);
    });
    jQuery('#dialog-confirm').bind('dialogclose', function(event) {
        location.reload();
    });
    jQuery('.gn-icon-download').bind('click',function(event){
        var csv = jQuery('#').text();
        window.location.href = 'data:text/csv;charset=UTF-8,'+ encodeURIComponent(csv);
    });
    jQuery('#tabledata').dataTable({
        dom: 'T<"clear">lfrtip',
        tableTools: {
            "sSwfPath": "../etc/page2/specific/DataTables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
        }
    });
});
function successdata(data){
    alert(data.message);
}
/*
function getData(ta){
    var table = jQuery('.dataTable');
     console.log(ta);
    var tdata=ta['data']['tableData'];

    for (var i=0;i<tdata.length;i++){
        
        var details=JSON.parse(tdata[i]["Details"]);
            var vehicleId=tdata[i]['Vehicle_Id'];
            vehicleId=vehicleId.trim();
            var data="<tr><td class='gn-icon delete' data-geofid="+tdata[i]['Geofence_Id']+"><span>Delete</span></td>";
            data += "<td> <a href='#gMap' class='fence_data'>"+tdata[i]['Geofence_Name']+"</a></td>";
            data += "<td>"+vehicleId+"</td>";
            if(details["type"]===undefined){
                data += '<td>NA</td>';  
            }
            else{
                data += '<td class="type"> '+details["type"]+'</td>';
            }
            if(details["radius"]===undefined){
                data += '<td>NA</td>';  
            }
            else{
                data+='<td class="radius"> '+details["radius"]+'</td>';
            }
            if(details["geometry"]===undefined){
                data += '<td>NA</td></tr>'; 
            }
            else{
                data += '<td class="geometry" data-geomet='+details+'>'+details["geometry"]+'</td></tr>';
            }
            table.append(data);
        }
        console.log(table);
}
*/
function callback(value,data) {
    if (value) {
        
        sendAjaxRequest('newGeoVehicle_delData',data);
        alert("Deleted successfully");
        location.reload();
    } else {
        alert("Rejected");
        location.reload();
    }
}
function fnOpenNormalDialog(data) {
    jQuery("#dialog-confirm").html("Are you sure you want to delete?");

    // Define the Dialog and its properties.
    jQuery("#dialog-confirm").dialog({
        resizable: false,
        modal: true,
        title: "Confirm Box",
        height: 200,
        width: 300,
        buttons: {
            "Yes": function () {
                jQuery(this).dialog('close');
                callback(true,data);
            },
            "No": function () {
                jQuery(this).dialog('close');
                callback(false);
            }
        }
    });
}
 clearShapes = function () {
            geometry_shape.setMap(null);
            geometry_shape = {};
        };
/*
 save_encode=function(){
     var data = IO.IN(geometry_shape, true);
     jQuery('#data').val(JSON.stringify(data));
 };
 */
   byId = function (s) {
            return document.getElementById(s)
        }




/******************************Saving Data in Json Encoded Form*****************************/
var IO = {

    //returns array with storable google.maps.Overlay-definitions
    IN: function (arr, //array with google.maps.Overlays
    encoded //boolean indicating whether pathes should be stored encoded
    ) {
        var shapes = [],
            goo = google.maps,
            shape, tmp;

        //for (var i = 0; i < arr.length; i++) {
            shape = arr;
            tmp = {
                type: this.t_(shape.type),
                id: shape.id || null
            };


            switch (tmp.type) {
                case 'CIRCLE':
                    tmp.radius = shape.getRadius();
                    tmp.geometry = this.p_(shape.getCenter());
                    break;
                case 'MARKER':
                    tmp.geometry = this.p_(shape.getPosition());
                    break;
                case 'RECTANGLE':
                    tmp.geometry = this.b_(shape.getBounds());
                    break;
                case 'POLYLINE':
                    tmp.geometry = this.l_(shape.getPath(), encoded);
                    break;
                case 'POLYGON':
                    tmp.geometry = this.m_(shape.getPaths(), encoded);

                    break;
            }
            shapes=tmp;
        

        return shapes;
    },
    //returns array with google.maps.Overlays
    OUT: function (arr, //array containg the stored shape-definitions
    map //map where to draw the shapes
    ) {
        var shapes = [],
            goo = google.maps,
            map = map || null,
            shape, tmp;

       // for (var i = 0; i < arr.length; i++) {
            shape = arr;

            switch (shape.type) {
                case 'CIRCLE':
                    tmp = new goo.Circle({
                        radius: Number(shape.radius),
                        center: this.pp_.apply(this, shape.geometry)
                    });
                    break;
                case 'MARKER':
                    tmp = new goo.Marker({
                        position: this.pp_.apply(this, shape.geometry)
                    });
                    break;
                case 'RECTANGLE':
                    tmp = new goo.Rectangle({
                        bounds: this.bb_.apply(this, shape.geometry)
                    });
                    break;
                case 'POLYLINE':
                    tmp = new goo.Polyline({
                        path: this.ll_(shape.geometry)
                    });
                    break;
                case 'POLYGON':
                    tmp = new goo.Polygon({
                        paths: this.mm_(shape.geometry)
                    });

                    break;
            }
            tmp.setValues({
                map: map,
                id: shape.id
            })
            shapes=tmp;
        return shapes;
    },
    l_: function (path, e) {
        path = (path.getArray) ? path.getArray() : path;
        if (e) {
            return google.maps.geometry.encoding.encodePath(path);
        } else {
            var r = [];
            for (var i = 0; i < path.length; ++i) {
                r.push(this.p_(path[i]));
            }
            return r;
        }
    },
    ll_: function (path) {
        if (typeof path === 'string') {
            return google.maps.geometry.encoding.decodePath(path);
        } else {
            var r = [];
            for (var i = 0; i < path.length; ++i) {
                r.push(this.pp_.apply(this, path[i]));
            }
            return r;
        }
    },

    m_: function (paths, e) {
        var r = [];
        paths = (paths.getArray) ? paths.getArray() : paths;
        for (var i = 0; i < paths.length; ++i) {
            r.push(this.l_(paths[i], e));
        }
        return r;
    },
    mm_: function (paths) {
        var r = [];
        for (var i = 0; i < paths.length; ++i) {
            r.push(this.ll_.call(this, paths[i]));

        }
        return r;
    },
    p_: function (latLng) {
        return ([latLng.lat(), latLng.lng()]);
    },
    pp_: function (lat, lng) {
        return new google.maps.LatLng(lat, lng);
    },
    b_: function (bounds) {
        return ([this.p_(bounds.getSouthWest()),
        this.p_(bounds.getNorthEast())]);
    },
    bb_: function (sw, ne) {
        return new google.maps.LatLngBounds(this.pp_.apply(this, sw),
        this.pp_.apply(this, ne));
    },
    t_: function (s) {
        var t = ['CIRCLE', 'MARKER', 'RECTANGLE', 'POLYLINE', 'POLYGON'];
        for (var i = 0; i < t.length; ++i) {
            if (s === google.maps.drawing.OverlayType[t[i]]) {
                return t[i];
            }
        }
    }
};