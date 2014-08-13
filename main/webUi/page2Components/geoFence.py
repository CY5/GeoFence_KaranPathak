from .page2Component import Page2Component
from appConfig import AppConfig
from utils import Validator
import cherrypy
import json


class GeoFence(Page2Component):
	def __init__(self, parent, **kwargs):
		Page2Component.__init__(self, parent, **kwargs)


	#

	def handler(self, nextPart, requestPath):
		if nextPart == 'newGeoFenceForm':
			return self._newGeoFenceForm(requestPath)
		elif nextPart == 'newGeoFenceFormAction':
			return self._newGeoFenceFormAction(requestPath)
		elif nextPart == 'newGeoVehicle_delData':
			return self._newGeoVehicle_delData(requestPath)
		#

	#



	def _newGeoFenceForm(self, requestPath):

		proxy, params = self.newProxy()

		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'specific', 'css', 'geoFenceForm.css')
		)
		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'specific','DataTables','media','css','jquery.dataTables.css')
		)
		params['externalJs'].append("https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry&libraries=drawing")
		params['externalJs'].append(
			self.server.appUrl('etc','page2','specific','DataTables','media','js','jquery.dataTables.js')
		)
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'specific', 'js', 'geoFenceForm.js')
		)
		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'specific','DataTables','extensions','TableTools','css','dataTables.tableTools.css')
		)	
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'specific','DataTables','extensions','TableTools','js','dataTables.tableTools.js')
		)
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'specific','DataTables','extensions','media','ZeroClipboard','ZeroClipboard.js')
		)
		params['externalJs'].append(
			self.server.appUrl('etc','page2','specific','js','geoFenceForm_partial.js')
		)

		db = self.app.component('dbHelper')
		with self.server.session() as session:
			self.username = session['username']
			self.userId = session['userId']
		#
		self.vehicleList = db.returnVehicleList(self.userId)
		self.tableData = []
		db = self.app.component('dbManager')
		with db.session() as session:
			query = session.query(db.Gps_Geofence_Data).filter_by(User_Id=self.userId)
			for obj in query.all():
				self.tableData.append(
					{'Geofence_Id': obj.Geofence_Id,'Geofence_Name': str(obj.Geofence_Name), 'Vehicle_Id': obj.Vehicle_Id, 'Details':obj.Details}
					)
		return self._renderWithTabs(
			proxy, params,
			bodyContent=proxy.render('GeoFenceForm.html',userId=self.userId ,vehicleList=self.vehicleList, tableData=self.tableData),
			newTabTitle='Create Geo Fence',
			url=requestPath.allPrevious(),
		)

	#


	def _newGeoFenceFormValidate(self, formData):
		def checkVehicleId(data):
			dbHelper = self.app.component('dbHelper')
			data=[x.strip() for x in data.split(',')]
			for i in data:
				if dbHelper.checkVehicleExists(self.userId, i):
					return None
				else:
					return "Unknown Vehicle"


		def checkDecimalList(data):
			for x in data.split(','):
				result=checkDecimal(x)

				if result:
					return "Invalid Coordinates"

			return None



		def checkDecimal(data):
			try:
				first = data.split('.')[0]
				second = data.split('.')[1]
				int(first)
				int(second)
			except:
				return True
			else:
				return False

		v = Validator(formData)
		vehicleId = v.required('vehicleId')
		vehicleId.validate('custom', checkVehicleId)

		fencename = v.required('fenceName')
		fencename.validate('type', str)

		Details = v.required('Details')
		Details.validate('type', str)
		print(v.errors)
		return v.errors;

	#

	def _newGeoFenceFormAction(self, requestPath):

		formData = json.loads(cherrypy.request.params['formData'])
		print("*************************Submitted**********************************")
		print(formData)
		errors = self._newGeoFenceFormValidate(formData)
		db = self.app.component('dbManager')

		if errors:
			return self.jsonFailure('validation failed', errors=errors)
		#


		with db.session() as session:
			gps_data = db.Gps_Geofence_Data.newFromParams({
			'Geofence_Id': db.Entity.newUuid(),
			'Geofence_Name': formData['fenceName'],
			'Vehicle_Id': formData['vehicleId'],
			'User_Id': self.userId,
			'Coordinate_Id': db.Entity.newUuid(),
			'Details': formData['Details'],
			})
			session.add(gps_data)

		return self.jsonSuccess('Geo Fence Saved !')


		#
		#
	


	def _newGeoVehicle_delData(self,requestPath):
		formData = json.loads(cherrypy.request.params['formData'])
		print("********************Inside Delete*******************")
		print(formData)
		Geofence_Id=formData['fenceId'];

		db = self.app.component('dbManager')
		taData=[]
		with db.session() as session:
			session.query(db.Gps_Geofence_Data).filter(db.Gps_Geofence_Data.Geofence_Id == formData['fenceId']).delete()

		with db.session() as session:
			query = session.query(db.Gps_Geofence_Data).filter_by(User_Id=self.userId)
			for obj in query.all():
				taData.append(
					{'Geofence_Id': obj.Geofence_Id,'Geofence_Name': str(obj.Geofence_Name), 'Vehicle_Id': obj.Vehicle_Id, 'Details':obj.Details}
					)
		return self.jsonSuccess('Geo Fence Deleted !', tableData=taData)	
	#


	#def _newGeoVehicle_updateData(self,requestPath):
	#	formData= json.loads(cherrypy.request.params['formData'])
	#	errors = self._newGeoFenceFormValidate(formData)
	#	db = self.app.component('dbManager')
	#	print(formData)
	#	if errors:
	#		return self.jsonFailure('validation failed', errors=errors)

	#	with db.session() as session:
	#		gps_data = db.Gps_Geofence_Data.newFromParams({
	#		'Geofence_Name': formData['fenceName'],
	#		'Vehicle_Id': formData['vehicleId'],
	#		'Details': formData['Details'],
	#		})
	#		session.query(db.Gps_Geofence_Data).filter(db.Gps_Geofence_Data.Geofence_Id == formData['fenceID']).update({gps_data})
	#		session.commit()



	#def _newGeoVehicle_getData(self,requestPath):
	#	formData = json.loads(cherrypy.request.params['formData'])
	#	#print(v.errors)
	#	num=[]
	#	vehicleId=formData['vehicleId']
	#	db = self.app.component('dbManager')

	#	with db.session() as session:
	#		query = session.query(db.Gps_Coordinate_Data).filter_by(Vehicle_Id=vehicleId)
			#print(query.count)
	##		for obj in query.all():
	#			num.append({"position": {"latitude": str(obj.Latitude), "longitude": str(obj.Longitude)},
	#			            "time": {"hour": int(obj.Time[0:2]), "minute": int(obj.Time[2:4]),
	#			                     "second": int(obj.Time[4:6])}, "vehicleId": int(obj.Vehicle_Id)})

	#	return self.jsonSuccess('Geo Fence Saved !', data=num)