import sys
import jjencode

print ("Injecting copyright info code ...")
print ("Destination file: " + sys.argv[1])

file1 = open(sys.argv[1])
file1_contents = file1.read()

# Injecting copyright info code
# ig.system.context.save();
# ig.system.context.font = "20px Arial";
# ig.system.context.textBaseline = "bottom";
# ig.system.context.textAlign = "right";
# ig.system.context.fillText('This version is for demo purposes only. Copyright MarketJS.com', ig.system.width-1, ig.system.height-1);
# ig.system.context.restore();

uglifiedFunction = 'ig.system.context.save(),ig.system.context.font="20px Arial",ig.system.context.textBaseline="bottom",ig.system.context.textAlign="right",ig.system.context.fillText("For demo purposes only. Copyright MarketJS.com",ig.system.width-1,ig.system.height-1),ig.system.context.restore();'
jjencodedText = jjencode.JJEncoder(uglifiedFunction, '_').encoded_text

new_code = file1_contents.replace('this.COPYRIGHT;',jjencodedText)
file1.close()

file2 = open(sys.argv[1],'w')
file2.write(new_code)
file2.close()
