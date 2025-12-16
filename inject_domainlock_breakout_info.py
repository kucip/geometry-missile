import sys
import jjencode

print ("Injecting domainlock breakout attempt info code ...")
print ("Destination file: " + sys.argv[1])

file1 = open(sys.argv[1])
file1_contents = file1.read()

# Injecting domainlock breakout attempt info code
# window.dba = {};
# window.dba.dlwf = function(){    
#     window.alert("Attempted software breach. Please contact support@marketjs.com");
# };
# Object.freeze(window.dba);

dbaf = 'window.dba={},window.dba.dlwf=function(){window.alert("Attempted software breach. Please contact support@marketjs.com")},Object.freeze(window.dba);'
jjencodedText = jjencode.JJEncoder(dbaf, '_').encoded_text

new_code = file1_contents.replace('this.DOMAINLOCK_BREAKOUT_ATTEMPT;',jjencodedText)
file1.close()

file2 = open(sys.argv[1],'w')
file2.write(new_code)
file2.close()