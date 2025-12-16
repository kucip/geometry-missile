IMPACTJS MARKETJS PLATFORM
==========================
### A cleaner, simpler approach to building HTML5 games

#### GUIDE, DOCS & REFS:
* ##### [ImpactJS](http://impactjs.com/documentation)
* ##### [Storage Manager Plugin](https://docs.google.com/document/d/14kzaC8yl2QbJzMFEIkIJWviY78GW0Cnz7WF9GRh9Klg/edit?usp=sharing)
* ##### [FAQ](https://bit.ly/mjs-faq)

##### Install Javascript Obfuscator CLI
1. Download and Install [Node.js & npm](https://docs.npmjs.com/getting-started/installing-node)
2. Install [javascript-obfuscator](https://www.npmjs.com/package/javascript-obfuscator) globally: `npm i -g javascript-obfuscator`
Note that you only need to do this once. 

#### Notes: 

##### Versioning System
To help developers and testers in determining and examining version number of the game builds, a versioning system is introduced.  

The versioning system consists of 2 parts, version number and build number. 
- Version number follows the general [semantic versioning specification](http://semver.org/) as in "MAJOR.MINOR.PATCH" format, starting from 1.0.0 (as first release). 
- Build number is automatically incremented by 1 every time the programmer compiles a new build, starting from 1 (as first build). Build number doesn't reset so we can keep track of how many times the game builds have been created. 

Version number and build number is added and stored in to `./settings/dev.js` and `./settings/production.js`.  
A complete version tag will be `v{VERSION_NUMBER}+build.{BUILD_NUMBER}` for example `v1.0.0+build.1`.  
This can be displayed in the game (canvas drawn) and/or logged in the Javascript console. 

We strongly recommend to specify which update types of the changes being released, so we understand the extent of changes in a given version. 
See below for details on how and when to increment the version number. 

| Update | Command                 | Status                                    | Rule                                                               | Example version |
|--------|-------------------------|-------------------------------------------|--------------------------------------------------------------------|-----------------|
| Reset  | `bash push.sh -u reset` | New build or first release                | Reset version number to 1.0.0                                      | 1.0.0 (base)    |
| Patch  | `bash push.sh -u patch` | Backward compatible bug fixes             | Increment the third digit                                          | 1.0.1           |
| Minor  | `bash push.sh -u minor` | Backward compatible new features          | Increment the middle digit and reset last digit to zero            | 1.1.0           |
| Major  | `bash push.sh -u major` | Changes that break backward compatibility | Increment the first digit and reset middle and last digits to zero | 2.0.0           |


##### Security related
As of March 5th 2020 anti-piracy security updates, javascript obfuscation is now part of the game compilation process ( '-b' task from push.sh). 

In push.sh, added secure_strong and secure_regular: 

- secure_regular excludes framebreaker and copyright message (for clients typically -> easier for integration)  
- secure_strong has all the goods

----


As of January 16th 2020 AWS security updates, hardcoded S3 Access Keys will be removed from boto-s3-upload.py script. 

You will have to setup AWS Environment Variables on your local machine to access S3 services. 

To learn more, visit: https://bit.ly/mjs-aws-keystore

----

#### Fix for SSL Error `[SSL: CERTIFICATE_VERIFY_FAILED]`
Try installing [certifi](https://pypi.org/project/certifi/) package. 
For Mac user, you can install by executing the command anywhere in terminal: `/Applications/Python\ {VERSION}/Install\ Certificates.command`

```shell
# For example
# Python 2.7
/Applications/Python\ 2.7/Install\ Certificates.command

# Python 3.6
/Applications/Python\ 3.6/Install\ Certificates.command
```

