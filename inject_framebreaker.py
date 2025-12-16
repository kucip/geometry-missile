import sys
import jjencode

print ("Injecting framebreaker ...")
print ("Destination file: " + sys.argv[1])

file1 = open(sys.argv[1])
file1_contents = file1.read()

# Inject framebreaker code
restricted_domain = 'marketjs.com' # should be https://marketjs.com, once SSL is up

framebreaker = 'if(document.referrer.indexOf(\"' + restricted_domain + '\")<0){if(top!=self){console.log(\"showing anti-piracy layer ...\");$(\"#anti-piracy\").show();top.location.replace(self.location.href);}}'
jjencodedText = jjencode.JJEncoder(framebreaker, '_').encoded_text

new_code = file1_contents.replace('this.FRAMEBREAKER;',jjencodedText)
file1.close()

file2 = open(sys.argv[1],'w')
file2.write(new_code)
file2.close()