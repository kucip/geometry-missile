import sys

print ("Injecting domainlock ...")
print ("Source file: " + sys.argv[1]) # The domainlocked file
print ("Destination file: " + sys.argv[2]) # The game.js

print ("Target start marker: " + sys.argv[3])
print ("Target end marker: " + sys.argv[4])

# Destination
file1 = open(sys.argv[2])
file1_contents = file1.read()

# Source
file2 = open(sys.argv[1])
file2_contents = file2.read()

def get_middle_text(line, string_start, string_end):
	temp = line.split(string_start)[1]
	return temp.split(string_end)[0]

string_start = sys.argv[3]
string_end = sys.argv[4]

result = get_middle_text(file1_contents, string_start, string_end)
result2 = file1_contents.replace(result,file2_contents)

# Cleaning up
result2 = result2.replace(string_start,'')
result2 = result2.replace(string_end,'')
file2.close()
file1.close()

# Apply to destination
file3 = open(sys.argv[2],'w')
file3.write(result2)

file3.close()

print ("Domainlock injection done ...")