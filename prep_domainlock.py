file1 = open('lib/game/main.js')
file1_contents = file1.read()

def get_middle_text(line, string_start, string_end):
	temp = line.split(string_start)[1]
	return temp.split(string_end)[0]

result = get_middle_text(file1_contents, 'this.START_OBFUSCATION;', 'this.END_OBFUSCATION;')

file2 = open('domainlock.js','w')
file2.write(result)

file2.close()
file1.close()
