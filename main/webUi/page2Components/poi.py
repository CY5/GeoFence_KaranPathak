from .page2Component import Page2Component
from appConfig import AppConfig
from utils import Validator
import cherrypy
import json


class Poi(Page2Component):
	def __init__(self, parent, **kwargs):
		Page2Component.__init__(self, parent, **kwargs)

	#

	def handler(self, nextPart, requestPath):
		if nextPart == 'newPoiForm':
			return self._newPoiForm(requestPath)
		elif nextPart == 'newPoiFormAction':
			return self._newPoiFormAction(requestPath)
		elif nextPart == 'getPoiData':
			return self.getPoiData(requestPath)
		elif nextPart == 'generateReport':
			return self.generateReport(requestPath)
		#

	#

	def generateReport(self, requestPath):
		formData = json.loads(cherrypy.request.params['formData'])
		db = self.app.component('dbHelper')
		print(formData)
		with self.server.session() as session:
			poidata = db.returnPoiReport(session['userId'])

		print(poidata)

		return self.jsonSuccess(poidata)


	def getPoiData(self, requestPath):
		formData = json.loads(cherrypy.request.params['formData'])
		db = self.app.component('dbHelper')
		# todo:db query for poi list
		#return self.jsonSuccess(db.returnPoiList(self.userId, formData['userEnteredString']['vehicle']))
		return self.jsonSuccess("done")

	def _newPoiForm(self, requestPath):
		with self.server.session() as session:
			self.username = session['username']
			self.userId = session['userId']
		#
		proxy, params = self.newProxy()
		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'specific', 'css', 'poiForm.css')
		)
		params['externalJs'].append('http://maps.googleapis.com/maps/api/js?v=3.exp')
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'specific', 'js', 'poiForm.js')
		)
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'generic', 'js', 'flexigrid.js')
		)
		params['externalJs'].append(
			self.server.appUrl('etc', 'page2', 'generic', 'js', 'flexigrid.pack.js')
		)
		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'generic', 'css', 'flexigrid.pack.css')
		)
		params['externalCss'].append(
			self.server.appUrl('etc', 'page2', 'generic', 'css', 'flexigrid.css')
		)

		db = self.app.component('dbHelper')
		vehicleList = db.returnVehicleList(self.userId)
		addressList = [{'value': 1, 'display': 'a'}, {'value': 2, 'display': 'b'}, {'value': 3, 'display': 'c'}]
		subCategoryList = [{'value': 1, 'display': 'a'}, {'value': 2, 'display': 'b'}, {'value': 3, 'display': 'c'}]
		branchList = [{'value': 1, 'display': 'a'}, {'value': 2, 'display': 'b'}, {'value': 3, 'display': 'c'}]
		companyList = [{'value': 1, 'display': 'a'}, {'value': 2, 'display': 'b'}, {'value': 3, 'display': 'c'}]
		classdata = ['Company', 'Branch', 'Poi Name', 'Address Category', 'Subcategory', 'Street', 'City', 'State']
		return self._renderWithTabs(
			proxy, params,
			bodyContent=proxy.render('poiForm.html', vehicleList=vehicleList, addressList=addressList,
			                         subCategoryList=subCategoryList, branchList=branchList, companyList=companyList,
			                         classdata=classdata),
			newTabTitle='Add POI',
			url=requestPath.allPrevious(),
		)

	#


	def _newPoiFormValidate(self, formData):

		# s = formData['poiList']
		#
		# def checkVehicleId(data):
		# dbHelper = self.app.component('dbHelper')
		# if dbHelper.checkVehicleExists(self.userId, data):
		# return None
		# else:
		# 		return "Unknown Vehicle"
		#
		# def checkDecimal(data):
		#
		# 	try:
		# 		first = data.split('.')[0]
		# 		second = data.split('.')[1]
		# 		int(first)
		# 		int(second)
		# 	except:
		# 		return "Invalid Coordinates"
		# 	else:
		# 		return None
		#
		# for v in s:
		# 	a = Validator(v)
		#
		# 	latitude = a.required('latitude')
		# 	latitude.validate('custom', checkDecimal)
		#
		# 	longitude = a.required('longitude')
		# 	longitude.validate('custom', checkDecimal)
		#
		# 	address = a.required('address')
		# 	address.validate('type', str)
		#
		# 	vehicleId = a.required('vehicleId')
		# 	vehicleId.validate('custom', checkVehicleId)
		#
		# 	if a.errors:
		# 		return a.errors;
		return None


	def _newPoiFormAction(self, requestPath):
		formData = json.loads(cherrypy.request.params['formData'])
		print(formData)
		errors = self._newPoiFormValidate(formData)
		if errors:
			return self.jsonFailure('validation failed', errors=errors)
		#

		db = self.app.component('dbManager')

		with db.session() as session:
			poi_data = db.Gps_Poi_Info.newFromParams({
			'Poi_Id': db.Entity.newUuid(),
			'User_Id': self.userId,
			'Vehicle_Id': formData['vehicleID'],
			'Poi_Name': formData['placeName'],
			'Poi_Latitude': formData['latitude'],
			'Poi_Longitude': formData['longitude'],
			})
			session.add(poi_data)

		return self.jsonSuccess('Poi Successfully Saved')


		#
		#