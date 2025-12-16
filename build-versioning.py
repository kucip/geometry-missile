import sys
import semver
import re

def versioning(input_file, output_file):
    input_file = open(input_file, "r")
    input_file_content = input_file.read()
    input_file.close()

    version_string = "1.0.0"
    build_string = "1"
    
    version_pattern = re.compile(r"['\"]?Version['\"]?\s*:\s*['\"]?([\d.]+)['\"]?")
    build_pattern = re.compile(r"['\"]?Build['\"]?\s*:\s*['\"]?([\d.]+)['\"]?")
    
    version_search = version_pattern.search(input_file_content, re.MULTILINE)
    build_search = build_pattern.search(input_file_content, re.MULTILINE)

    if version_search:
        version_string = str(version_search.group(1) or version_string)

    if build_search:
        build_string = str(build_search.group(1) or version_string)
    
    # print (input_file, "Read current version string", version_string + "+build." + str(build_string) )

    argv = sys.argv
    if len(argv) > 1:
        update = str(argv[1]).lower()
        if (update == "print"):
            print ("Build version: v" + version_string + "+build." + str(build_string))
            exit()
        elif (update == "major"):
            version_string = semver.bump_major(version_string)
        elif (update == "minor"):
            version_string = semver.bump_minor(version_string)
        elif (update == "patch"):
            version_string = semver.bump_patch(version_string)
        elif (update == "reset"):
            version_string = "1.0.0"
            build_string = "0"
    else:
        build_string = str(int(build_string) + 1)
    
    output_file_content = input_file_content
    output_file_content = re.sub(build_pattern, "'Build': '" + str(build_string) +"'", output_file_content)
    output_file_content = re.sub(version_pattern, "'Version': '" + str(version_string) +"'", output_file_content)
    
    output_file = open(output_file, "w")
    output_file.write(output_file_content)
    print ("Injected new build version string", "v" + version_string + "+build." + str(build_string) )
    output_file.close()

versioning("settings/dev.js", "settings/dev.js")