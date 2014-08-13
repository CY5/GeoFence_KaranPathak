fitx.utils.require(['fitx', 'page2', 'vehicle'])

jQuery(window).load(function () {
	onLoadFunc_newVehicle ()
})

var onLoadFunc_newVehicle = function () {

	jQuery('.vehicleTable').show()
	jQuery('.newVehicleForm').hide()
	
	setupAJAXSubmit('newVehicleFormOk','newVehicleFormAction',setupData,setupConstraints,'#submit')
	setupFlexiGrid('#vehicleTable', undefined, "Vehicle Details", undefined, undefined, undefined, undefined, classData, undefined, setupButtonDict(), {'bindUrl': 'vehicleData'})

	jQuery('#cancel').click(function(){
		jQuery('.vehicleTable').show()
		jQuery('.newVehicleForm').hide()
		jQuery('input').each(function(){
			jQuery(this).val('')
		})
	})
}

var setupData = function () {
	var data = {}
	
	data.vehicleRegNo = jQuery ('#vehicleRegNo').val ()
	data.vehicleName = jQuery ('#vehicleName').val ()
	data.vehicleMake = jQuery ('#vehicleMake').val ()
	data.vehicleType = jQuery ('#vehicleType').val ()

	return data
}

var setupConstraints = function () {

	var constraints = {

		vehicleRegNo: {
			presence: true
		},
		vehicleName: {
			presence: true
		},
		vehicleMake: {
			presence: true
		},
		vehicleType: {
			presence: true
		}
	}
	
	return constraints
}
function setupButtonDict() {
	var buttons = []
	var addButton = {'name': 'Add', 'class': 'add', 'click': addButtonClick}
	buttons.push(addButton)
	var editButton = {'name': 'Edit', 'class': 'edit', 'click': editButtonClick}
	buttons.push(editButton)
	var deleteButton = {'name': 'Delete', 'class': 'delete', 'click': deleteButtonClick}
	buttons.push(deleteButton)
	return buttons

}

function addButtonClick(com, grid, c, selectedData) {
	jQuery('.newVehicleForm').show();
	jQuery('.vehicleTable').hide();
}

function editButtonClick(com, grid, c, selectedData) {
	if (c == 1) {
		jQuery('.trSelected', grid).each(function () {
			var editFields = Array()
			editFields.push({id: jQuery(this).data('id')})
			editFields.push({'name': jQuery('td[abbr="Name"] >div', this).html()})
			editFields.push({'username': jQuery('td[abbr="UserName"] >div', this).html()})
			editFields.push({'dob': jQuery('td[abbr="DOB"] >div', this).html()})
			editFields.push({'address': jQuery('td[abbr="Address"] >div', this).html()})
			editFields.push({'email': jQuery('td[abbr="email-address"] >div', this).html()})
			editFields.push({'mobile': jQuery('td[abbr="Phone No."] >div', this).html()})
			editFields.push({'personId': jQuery('td[abbr="Uid"] >div', this).html()})
			var div = jQuery('#addUser')
			jQuery.each(editFields, function (k, v) {
				for (var key in v) {
					var value = v[key];
					div.find('.' + key).val(value)

				}
			})

			jQuery("#tableDiv").toggle('showOrHide')
			jQuery('#addUser').toggle('showOrHide')
			div.find('.ok').text('Edit')
			div.find('.ok').removeClass('ok')
				.addClass('editbutton')
			div.find(':input[class=personId]').attr('disabled', 'disabled')

		})
	}
	else {
		alert('select single row to edit')
	}
}
function deleteButtonClick(com, grid, c, selectedData) {
	if (c == 1) {
		jQuery('.trSelected', grid).each(function () {
			var delFields = {}
			delFields.id = jQuery('td[abbr="Uid"] >div', this).html()
			delFields.name = jQuery('td[abbr="UserName"] >div', this).html()
			sendAjaxRequest('delVehicleDataAction', delFields, function () {
				onReload('vehicleData')
			})

		})
	}
	else {
		alert('select single row to delete')
	}
}
