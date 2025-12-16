#!/usr/bin/env python
# made by Michael Ong for MarketJS
# updated and maintained by Alif Harsan for MarketJS
# version 1.0.5
# documentation - https://bit.ly/pre-qa-checker-tool

from operator import truediv
import os
import sys,getopt
import math
import re
os.system("")  # enables ansi escape characters in terminal
    
class LogState:
    GOOD = 1
    WARN = 2
    BAD = 3
    ERROR = 4
    INFO = 5
class Logger:
    def __init__(self):
        self.NUM_OF_TABS = 0
    def Log(self,log_state,msg):
        if(msg == ''):
            print('')
            return
        state = 'GOOD'
        color = '\033[92m'
        if(log_state == LogState.WARN):
            state = 'WARN'
            color = '\033[93m'
        elif(log_state == LogState.BAD):
            state = '!! BAD !!'
            color = '\033[91m'
        elif(log_state == LogState.ERROR):
            state = '!! ERROR !!'
            color = '\033[91m'
        elif(log_state == LogState.INFO):
            state = 'INFO'
            color = '\033[0m'
        print('{0}{1}[{2}] {3}{4}'.format(color,'\t'*self.NUM_OF_TABS, state, msg, '\033[0m'))
logger = Logger()

class Checker:
    '''Meant to check files if they are found where they are supposed to be found'''
    
    HOW_TO_USE = """=== How to use Pre-QA Checker ===
    {0} -p . \t| check the current working directory
    {0} -p "<PATH>" \t| checks for missing files in paths found in the MarketJS project
    {0} --path "<PATH>" \t| the same as above
==========
    """
    def __init__(self):
        self.project_path = ''
        self.show_good_logs = True
        self.warnings_are_errors = False
        self.skip_promo_photos = False
        # will become an array of strings separated by comma
        self.ignore_folder = '.git,docs,glue,.vscode,node_modules,glue,config,lib,tools\n'
        self.ignore_file_ext = 'md,aif,tiff,au,psd,xcf,sh,py,pyc,php,bat,git,gitignore,gitkeep,tm_properties,txt,jar,DS_Store'
        self.path_settings = 'preqa_settings.txt'
        self.BANNER = """
        =======================
              Pre-QA Tool
        =======================
        """
        self._setup()
    def process_script_args(self,argv):
        '''
        processes the parameters passed into this script
        '''
        # -1 = error
        # 1 = check for good and bad files
        batch_process_type = -1
        how_to_use = Checker.HOW_TO_USE.format(sys.argv[0])
        if(len(argv) == 0):
            print(how_to_use)
            return

        try:
            opts, _ = getopt.getopt(argv,"hp:vw",["help","path=","silent","warn-as-errors"])
        except getopt.GetoptError as err:
            print("Error: Invalid command. {0}".format(err.msg))
            print (how_to_use)
            sys.exit(2)

        for opt, arg in opts:
            if opt in ('-h', "--help"):
                print ('---\n{0}'.format(how_to_use))
                sys.exit(2)
            elif opt in ("-p", "--path") and batch_process_type == -1:
                self.project_path = arg
                batch_process_type = 1
            elif opt in ("-s", "--silent"):
                self.show_good_logs = False
            elif opt in ("-w", "--warn-as-errors"):
                self.warnings_are_errors = True
        # call process function of integration helper
        if(batch_process_type == 1):
            self.check()
        elif(batch_process_type == -1):
            print("cannot start integration helper")
    def _setup(self):
        print(self.BANNER)

        # ensure we read the settings file in {project}/tools folder
        prepath = ''
        if(not os.getcwd().endswith('tools')):
            prepath = os.path.join(os.getcwd(),'tools')
        else:
            prepath = os.getcwd()
        self.path_settings = os.path.join(prepath,self.path_settings)

        logger.Log(LogState.INFO,"Reading settings in {0}".format(self.path_settings))
        # check if settings file exists
        if(not os.path.isfile(self.path_settings)):
            with open(self.path_settings,'w') as f:
                f.write(self.ignore_folder)
                f.write(self.ignore_file_ext)
        with open(self.path_settings) as f:
            # folder
            self.ignore_folder = f.readline().strip().split(',')
            logger.Log(LogState.INFO,'Ignore folders: {0}'.format(', '.join(self.ignore_folder)))
            
            # file extensions
            self.ignore_file_ext = f.readline().strip().split(',')
            logger.Log(LogState.INFO,'Ignore files: {0}'.format(', '.join(self.ignore_file_ext)))
        logger.Log(LogState.INFO,'')
    def _compute_size(self,path = '.', recommended_size = 3):
        '''Computes if the directory path is under the recommended size'''
        
        path = os.path.join(self.project_path,path)
        if(not os.path.isdir(path)):
            print('Error: path ({0}) is not a valid directory or folder'.format(path))
            return False

        # 2 refers to MB
        RECOMMENDED_SIZE_TYPE = 2
        SIZE_NAME = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
        def convert_size(size_bytes):
            if size_bytes == 0:
                return "0B"
            i = int(math.floor(math.log(size_bytes, 1024)))
            p = math.pow(1024, i)
            s = round(size_bytes / p, 2)
            return "%s %s" % (s, SIZE_NAME[i])
        def get_size(start_path = '.',skip_promo=True):
            total_size = 0
            for dirpath, _, filenames in os.walk(start_path):
                if(skip_promo):
                    sub_path = dirpath[len(self.project_path) + 1:]
                    if(os.path.join('media','graphics','promo') in sub_path):
                        # print('skipping ' + sub_path)
                        continue
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    # skip if it is symbolic link
                    if not os.path.islink(fp):
                        total_size += os.path.getsize(fp)

            return total_size

        sizeStr = convert_size(get_size(path))
        sizeInt = sizeStr[:-3]
        # checks what the type is
        sizeType = sizeStr[-2:]
        i = 0
        for name in SIZE_NAME:
            if(name == sizeType):
                sizeType = i
                break
            i += 1

        # output
        if(sizeType <= RECOMMENDED_SIZE_TYPE): 
            withinSizeReq = (sizeType < RECOMMENDED_SIZE_TYPE) or (float(sizeInt) <= recommended_size and sizeType == RECOMMENDED_SIZE_TYPE)

            if (not withinSizeReq):
                logger.Log(LogState.WARN,'{0} ({1}) is above the expected size of {2} {3}'.format(path[len(self.project_path):],sizeStr,recommended_size,SIZE_NAME[RECOMMENDED_SIZE_TYPE]))
                if(self.warnings_are_errors):
                    return False
            elif(withinSizeReq and self.show_good_logs):
                logger.Log(LogState.GOOD,'{0} ({1}) is within {2} {3}'.format(path[len(self.project_path):],sizeStr,recommended_size,SIZE_NAME[RECOMMENDED_SIZE_TYPE]))
            return True
        else: # if this block runs, it means the folder contains too much data
            logger.Log(LogState.BAD,'{0} ({1}) is way above the expected size of {2} {3}'.format(path[len(self.project_path):],sizeStr,recommended_size,SIZE_NAME[RECOMMENDED_SIZE_TYPE]))
            return False
    def _are_promo_assets_missing(self):
        '''Returns False if there are promo assets missing'''
        if(self.skip_promo_photos):
            logger.Log(LogState.INFO,'Skip checking promo assets')
            return True
        promo_path = os.path.join(self.project_path,'media','graphics','promo')
        folders = ['banners','icons','screenshots']
        photos = [
            ['180x120.jpg','440x280.jpg','1300x500.jpg'],
            ['64x64.png','96x96.png','128x128.png'],
            ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg',]
        ]
        something_is_missing = False
        hasWarned = False
        for i in range(0,len(folders)):
            fold = os.path.join(promo_path,folders[i])
            if(not os.path.isdir (fold)):
                logger.Log(LogState.BAD,'{0} is missing'.format(fold[len(self.project_path):]))
                something_is_missing = True
                continue
            for x in range(0,len(photos[i])):
                abs_path_to_photo = os.path.join(fold,photos[i][x])
                if(not os.path.isfile(abs_path_to_photo)):
                    something_is_missing = True
                    logger.Log(LogState.WARN,'{0} is missing'.format(abs_path_to_photo[len(self.project_path):]))
                    hasWarned = True
        if(hasWarned and self.warnings_are_errors):
            return False
        if(not something_is_missing and self.show_good_logs):
            logger.Log(LogState.GOOD,"All promo assets exists")
        return not something_is_missing
    def _check_for_illegal_characters(self):
        '''Returns False if has illegal characters'''
        rules = [
            lambda s: any(x.isupper() for x in s), # must have at least one uppercase
            lambda s: any(' ' in x for x in s),  # must have at least one space
        ]
        has_illegal_char = False
        for dirpath, _, filenames in os.walk(self.project_path):
            sub_path = dirpath[len(self.project_path) + 1:]
            ignore = False
            for folder in self.ignore_folder:
                folder = folder.strip()
                if(sub_path.startswith(folder)):
                    ignore = True
                    break
            if(ignore):
                continue
            
            for f in filenames:
                # check if ignore
                for ext in self.ignore_file_ext:
                    if(f.endswith(ext)):
                        ignore = True
                        break
                if(ignore): continue
                
                # get relative path
                fp = os.path.join(sub_path, f)
                # check
                if any(rule(fp) for rule in rules):
                    logger.Log(LogState.BAD,'Illegal character found in {0}'.format(fp))
                    has_illegal_char = True
        if(has_illegal_char):
            logger.Log(LogState.INFO,'Remove whitespaces and capital letters from the folder / file names')
        else:
            logger.Log(LogState.GOOD,'No whitespaces and capital letters from the folder / file names found')
        
        return not has_illegal_char
    def _check_favicon(self):
        '''Returns False if favicon does not exist'''
        file_exists = False
        graphics_path = os.path.join(self.project_path,'media','graphics')
        for dirpath, _, filenames in os.walk(graphics_path):
            for f in filenames:
                if(f == 'favicon.png'):
                    file_exists = True
                    graphics_path = dirpath
                    break
        if(not file_exists):
            logger.Log(LogState.BAD,'favicon.png is missing from {0}'.format(graphics_path))
        elif (self.show_good_logs):
            logger.Log(LogState.GOOD,'favicon.png is found in {0}'.format(graphics_path))
        return file_exists
    def _check_for_orient_files(self):
        '''Returns False if orient file does not exist. Requires only 1 to exist'''
        path = os.path.join(self.project_path,'media','graphics','orientate')
        has_orient_file = os.path.isfile(os.path.join(path,'landscape.jpg')) or os.path.isfile(os.path.join(path,'portrait.jpg'))
        if(not has_orient_file):
            logger.Log(LogState.INFO,'Orientation images (landscape.jpg or portrait.jpg) are missing from {0}. If this is a responsive game, feel free to ignore this.'.format(path[len(self.project_path):]))
        # will always return True because orientation images are deprecated due to responsive games
        return True #has_orient_file
    def _check_debug_mode(self):
        '''Returns False if the game is in debug mode'''
        path_main_js = os.path.join(self.project_path,'lib','game','main.js')
        # match all comments
        r_comments = r'(//.*)|(\/\*[\s\S]*?\*\/)'
        with open(path_main_js, 'r') as file:
            content = file.read()

            # remove commented lines
            content = re.sub(r_comments, '', content)

            debugModeLines = [
                'impact.debug.debug',
                'this.showDebugMenu()',
                'ig.game.showDebugMenu()'
            ]
            hasWarned = False
            for debugLine in debugModeLines:
                if(debugLine in content):
                    logger.Log(LogState.WARN,'In {0}, {1} still exists. Be sure to remove them or comment them out when pushing into production'.format(path_main_js[len(self.project_path):],debugLine))
                    hasWarned = True
            if(hasWarned and self.warnings_are_errors):
                return False
        return True
    def _check_for_text(self, relative_file_path,lines_to_look,if_exist_bad, error_msg):
        '''Returns False if bad'''
        path = os.path.join(self.project_path,relative_file_path)
        # match all comments
        r_comments = r'(//.*)|(\/\*[\s\S]*?\*\/)'
        with open(path, 'r') as file:
            content = file.read()

            # remove commented lines
            content = re.sub(r_comments, '', content)
            isBad = False
            for line in lines_to_look:
                if(if_exist_bad):
                    if(line in content):
                        logger.Log(LogState.BAD,'In {0}, {1} still exists. {2}'.format(path[len(self.project_path):],line,error_msg))
                        isBad = True
                else:
                    if(not line in content):
                        logger.Log(LogState.BAD,'In {0}, {1} does not exists. {2}'.format(path[len(self.project_path):],line,error_msg))
                        isBad = True
            if(isBad):
                return False
        return True
    def _check_versioning(self):
        '''Returns False if project has no versioning tool'''
        lines_to_look = ['inject_burst_cache_version_tag']
        if_exist_bad = False
        error_msg = 'Please implement versioning'

        # check if versioning line exist in push.sh
        nonprod = self._check_for_text('push.sh',lines_to_look,if_exist_bad,error_msg)
        prod = self._check_for_text('push-production.sh',lines_to_look,if_exist_bad,error_msg)

        if(nonprod and prod):
            logger.Log(LogState.GOOD,'Versioning implemented')
        return nonprod and prod
    def _check_javascript_obfuscator(self):
        '''Returns False if project has no javascript-obfuscator'''
        lines_to_look = ['javascript-obfuscator']
        if_exist_bad = False
        error_msg = 'Please implement javascript obfuscator'
        nonprod = self._check_for_text('push.sh',lines_to_look,if_exist_bad,error_msg)
        prod = self._check_for_text('push-production.sh',lines_to_look,if_exist_bad,error_msg)
        
        # check if setting file exists
        dev_path = os.path.join(self.project_path,'tools','javascript-obfuscator-dev.json')
        prod_path = os.path.join(self.project_path,'tools','javascript-obfuscator-production.json')
        dev_exist = os.path.exists(dev_path)
        prod_exist = os.path.exists(prod_path)
        file_settings_exist = dev_exist and prod_exist
        if(not dev_exist):
            logger.Log(LogState.BAD,'Missing tools/javascript-obfuscator-dev.json')
        if(not prod_exist):
            logger.Log(LogState.BAD,'Missing tools/javascript-obfuscator-production.json')
        if(nonprod and prod and file_settings_exist):
            logger.Log(LogState.GOOD,'javascript-obfuscator implemented')
        return nonprod and prod and file_settings_exist
    def _check_better_webaudio_unlock(self):
        '''Returns False if project has no javascript-obfuscator'''
        lines_to_look = ['TapToStartAudioUnlock']
        if_exist_bad = False
        error_msg = 'Please implement Better Webaudio Unlock'
        nonprod = self._check_for_text('settings/dev.js',lines_to_look,if_exist_bad,error_msg)
        prod = self._check_for_text('settings/production.js',lines_to_look,if_exist_bad,error_msg)
        splash_screen = self._check_for_text('lib/plugins/splash-loader.js',lines_to_look,if_exist_bad,error_msg)

        if(nonprod and prod and splash_screen):
            logger.Log(LogState.GOOD,'Better Webaudio Unlock implemented')
        return nonprod and prod and splash_screen
    def _check_fullscreen(self):
        '''Returns False if project doesn't implement Fullscreen plugin'''
        lines_to_look = ['ig.FullscreenButton']
        game_path = os.path.join(self.project_path,'lib','game')
        is_exist = False
        for dirpath, _, filenames in os.walk(game_path):
            for f in filenames:
                file_path = os.path.join(dirpath, f)
                with open(file_path, 'r') as file:
                    content = file.read()
                    for line in lines_to_look:
                        if(line in content):
                            is_exist = True
                            logger.Log(LogState.GOOD,'Fullscreen button detected: '+file_path[2:])  
        
        plugin_path = os.path.join(self.project_path,'lib','plugins','fullscreen.js')
        plugin_exist = os.path.exists(plugin_path)

        if(not plugin_exist):
            logger.Log(LogState.ERROR,'-- Fullscreen plugin not found, please implement Fullscreen plugin --')
        else:
            if(not is_exist):
                logger.Log(LogState.ERROR,'-- FullscreenButton not found, please implement Fullscreen button --')

        if(is_exist and plugin_exist):
            logger.Log(LogState.GOOD,'Fullscreen plugin implemented')
        return is_exist and plugin_exist
    def _check_font(self):
        '''Check if font plugin installed or font embedded via css'''
        font_plugin_path = os.path.join(self.project_path,'lib','plugins','font','font-info.js')
        plugin_exist = os.path.exists(font_plugin_path)
        is_exist = False

        if(plugin_exist):
            with open(font_plugin_path, 'r') as file:
                lines = file.readlines()
                for line in lines:          
                    if line.find('name:') != -1 and line.find('source:') != -1:
                        is_exist = True          
                        font_name = line.split('name:')[1].split(',')[0].strip()[1:-1]
                        font_location = line.split('source:')[1].split('}')[0].strip()[1:-1]
                        logger.Log(LogState.GOOD,'Font detected: '+font_name+' at '+font_location)  
            if(not is_exist):
                logger.Log(LogState.ERROR,'-- No font included in font-info.js, please check again --')

        if(not plugin_exist):
            logger.Log(LogState.INFO,'Project not using font-loader plugin, please check that the font have been embedded')

        if(is_exist and plugin_exist):
            logger.Log(LogState.GOOD,'Font loaded with font plugin')
        return is_exist and plugin_exist
    def _print_localization(self):
        '''Print localization string'''
        localization_path = os.path.join(self.project_path,'tools','localization.csv')
        string_path = os.path.join(self.project_path,'media','text','strings.js')

        game_title = ''
        dev_path = os.path.join(self.project_path,'dev.html')
        with open(dev_path, 'r') as file:
            for line in file:
                if(line.find('<title>') != -1):
                    game_title = line.split('<title>')[1].split('</title>')[0]
                    break

        with open(string_path) as file:
            with open(localization_path, "w") as file2:
                file2.write(game_title+',\n')
                for line in file:
					if(line.find(':') != -1):
						obj = line.split(':')[1]
						if(obj.find('\"') != -1):
							leftChar = obj.find('\"')+1
							rightChar = obj.rfind('\"')
							obj = obj[leftChar:rightChar]
							if(obj):
								file2.write(obj+',\n')
						elif(obj.find('\'') != -1):
							leftChar = obj.find('\'')+1
							rightChar = obj.rfind('\'')
							obj = obj[leftChar:rightChar]
							if(obj):
								file2.write(obj+',\n')  						

        logger.Log(LogState.GOOD,'Localization file ready at tools\\localization.csv (Should be removed after use)')
        return True
    def _check_jscrambler(self):
        '''Returns False if has JScrambler remnant files'''
        # jscrambler file
        jscrambler_path = os.path.join(self.project_path,'tools','jscrambler.php')
        has_jscrambler = os.path.exists(jscrambler_path)
        if(has_jscrambler):
            logger.Log(LogState.BAD,'Please remove {0}'.format(jscrambler_path[len(self.project_path):]))

        # check push.sh and push-production.sh
        lines_to_look = ['jscrambler']
        if_exist_bad = True
        error_msg = 'Please remove jscrambler code from build file'
        nonprod = self._check_for_text('push.sh',lines_to_look,if_exist_bad,error_msg)
        prod = self._check_for_text('push-production.sh',lines_to_look,if_exist_bad,error_msg)

        # client stuff
        has_secure_js = False
        files = [f for f in os.listdir(self.project_path) if os.path.isfile(f)]
        for f in files:
            if((f.startswith('secure_') and f.endswith('.php'))):
                logger.Log(LogState.BAD,'Please remove {0}'.format(f))
                has_secure_js = True

        is_good = (not has_jscrambler) and (not has_secure_js) and nonprod and prod

        if(is_good):
            logger.Log(LogState.GOOD,'Old JScrambler files removed')
        return is_good
    def _check_for_old_analytics(self):
        '''Returns False if has analytics_xxxx.js files'''
        # client stuff
        has_old_analytics = False
        files = [f for f in os.listdir(self.project_path) if os.path.isfile(f)]
        for f in files:
            if( (f.startswith('analytics_') and f.endswith('.js'))):
                logger.Log(LogState.BAD,'Please remove {0}'.format(f))
                has_old_analytics = True

        is_good = not has_old_analytics
        if(is_good):
            logger.Log(LogState.GOOD,'Old analytics files removed')
        return is_good
    def check(self):
        '''Main function that checks for all file discrepancies in Pre-QA'''
        logger.Log(LogState.INFO,'-- Start checking files --')
        logger.Log(LogState.INFO,'')
        success = [
            self._compute_size(os.path.join('media','graphics')),
            self._compute_size(os.path.join('media','audio'),1),
            self._are_promo_assets_missing(),
            self._check_favicon(),
            self._check_for_illegal_characters(),
            self._check_for_orient_files(),
            self._check_debug_mode(),
            self._check_javascript_obfuscator(),
            self._check_versioning(),
            self._check_jscrambler(),
            self._check_for_old_analytics(),
			self._check_better_webaudio_unlock(),
			self._check_fullscreen(),
			self._check_font(),
			self._print_localization()
        ]
        # use this for loop to debug the conditional statements in the list above
        # i = 0
        # for suc in success:
        #     logger.Log(LogState.INFO, '{0} is {1}'.format(i,suc))
        #     i+=1
        success = all(success)
        logger.Log(LogState.INFO,'')
        if(success):
            logger.Log(LogState.INFO,"Files for PreQA have no issues.")
        else:
            logger.Log(LogState.INFO,"Files for PreQA have issues. Resolve them before running the script again")

        logger.Log(LogState.INFO,'-- End of PreQA Checker --')
        
        return success

def main(argv):
    checker = Checker()
    checker.process_script_args(argv)

if __name__ == "__main__":
   main(sys.argv[1:])