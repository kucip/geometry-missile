import boto,os,sys

LANGUAGE_CODE = "en"
argv = sys.argv
if len(argv) > 1:
    LANGUAGE_CODE = argv[1]

conn = boto.connect_cloudfront(os.environ['AWS_ACCESS_KEY_ID_PRODUCTION'], os.environ['AWS_SECRET_ACCESS_KEY_PRODUCTION'])
folder_name = os.path.split(os.getcwd())[-1] # same as folder name
print ("Invalidating files: ")
paths = [
	LANGUAGE_CODE + '/' + folder_name + '/index.html',
    LANGUAGE_CODE + '/' + folder_name + '/game.js',
    LANGUAGE_CODE + '/' + folder_name + '/promo.zip',
    LANGUAGE_CODE + '/' + folder_name + '/media*', # Ensures the media assets are invalidated too
    LANGUAGE_CODE + '/' + folder_name + '/branding*', # To ensure the branding files are also cleared
    # Add more files
]

for path in paths:
	print (path)
inval_req = conn.create_invalidation_request(u'EUDC8GM21FR4P', paths)

print ('Cloudfront invalidation done ... please check again after 5 minutes')