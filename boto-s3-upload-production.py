# -*- coding: utf-8 -*-
"""
 MarketJS Amazon S3 Deployment System
 -----------------------------------------------------------------------
 Copyright (c) 2012 MarketJS Limited. Certain portions may come from 3rd parties and
 carry their own licensing terms and are referenced where applicable. 
 -----------------------------------------------------------------------
"""

import boto,os,re
import getopt, sys

from datetime import datetime
from boto.s3.connection import S3Connection
from boto.s3.key import Key

""" OWN SERVER """
conn = S3Connection(os.environ['AWS_ACCESS_KEY_ID_PRODUCTION'],os.environ['AWS_SECRET_ACCESS_KEY_PRODUCTION'])
BUCKET_NAME = 'marketjs-factory'
GAME_NAME = os.path.split(os.getcwd())[-1] # same as folder name
LANGUAGE_CODE = None

BUCKET = conn.get_bucket(BUCKET_NAME)
BUCKET_LOCATION = BUCKET.get_location()

def usage():
	print ('Options and arguments:')
	print ('-a --all	:  [uploads everything in folder]')
	
def uploadResultToS3(bucket,game_folder_name,srcDir):
	
	""" GETOPT """
	try:
		opts, args = getopt.getopt(sys.argv[1:], "hanl:v", ["help","all","new","language"])
	except getopt.GetoptError as err:
		# print help information and exit:
		print (str(err)) # will print something like "option -a not recognized"
		usage()
		sys.exit(2)
	
	""" PARAMS """	
	output = None
	verbose = False
	upload_all = False
	
	""" PARSE OPTS """
	for o, a in opts:
		if o == "-v":
			verbose = True
		elif o in ("-h", "--help"):
			usage()
			sys.exit()
		elif o in ("-n", "--new"):
			upload_all = False
			print ("upload all set True")
		elif o in ("-a", "--all"):
			upload_all = True
			print ("upload all set True")		
		elif o in ("-l", "--language"):
			print ("language chosen:" + a)
			LANGUAGE_CODE = a
		else:
			assert False, "unhandled option"
	
	""" BOTO """
	b = conn.get_bucket(bucket)
	k = Key(b)
	
	""" PATTERN MATCHING """	
	file_pattern = re.compile(r'.*\.(md$|aif$|tiff$|au$|psd$|xcf$|sh$|py$|pyc$|php$|bat$|git$|gitignore$|gitkeep$|tm_properties$|txt$|jar$|DS_Store$)')
	folder_pattern = re.compile(r'(\.git|.vscode|node_modules|glue|doc|config|lib|tools[\/\\]*?$)')

	""" UPLOAD SETTINGS """
	day_freshness = 1
	seconds_freshness = 86400/2
	
	if upload_all:
		print ('uploading ALL files in folders ...')
	else:		
		print ('uploading files < ' + str(day_freshness) + ' days' + ' and < ' + str(seconds_freshness/3600) + ' hours old ...')
	
	
	""" WALKING THE BUCKET """
	print ('preparing to walk the bucket named ' + b.name + '...')
			
	for path,dir,files in os.walk(srcDir):
		for file in files:			
			""" filter out unwanted file extensions (eg: xcf,sh,py)"""
			relativePath = os.path.relpath(path, srcDir)
			if not re.match(file_pattern,file) and not re.match(folder_pattern,relativePath):

				""" get freshness """
				last_modified_time_epoch_seconds = os.path.getmtime(os.path.join(path,file))
				last_modified_time = datetime.fromtimestamp(last_modified_time_epoch_seconds)
				delta = datetime.now()-last_modified_time
				
				if upload_all:
					upload(k,b,game_folder_name,path,file.decode('utf8'),srcDir,LANGUAGE_CODE)					
				else:					
					if delta.days < day_freshness and delta.seconds < seconds_freshness:
						upload(k,b,game_folder_name,path,file.decode('utf8'),srcDir,LANGUAGE_CODE)

	# For easy copy/pasting later
	print ("URL: https://cdn-factory.marketjs.com/en/" + GAME_NAME + "/index.html")
						
def upload(k,b,game_folder_name,path,file,srcDir,language_code):
	print ('Preparing bucket for upload')
	k.key = language_code + '/' + game_folder_name + "/" + os.path.relpath(os.path.join(path,file),srcDir)
	k.key = re.sub(r'\\', '/', k.key) #added to avoid forward slash in k.key 
	print ('sending ' + file + ' to https://s3-' + BUCKET_LOCATION + '.amazonaws.com/'  + b.name + '/' + k.key + ' ...')
	
	headers = {
		'Cache-Control': 'max-age=7776000'
	}
	
	k.set_contents_from_filename(os.path.join(path,file), headers)

	if path.find('_factory') >=0:
		print ('file set as private ...')
		k.set_acl('private')				
	else:
		print ('file set as public ...')
		k.set_acl('public-read')						

		
""" CHECK BEFORE RUNNING """
uploadResultToS3(BUCKET_NAME,GAME_NAME, os.getcwd())
