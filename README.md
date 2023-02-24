# Capstone
Steve, Mustafa, Ronny, and Josh, make sure that you either: (preferably) create a python virtual environment before running this; or at minimum, install all the dependencies.

## Checking out this repo
```bash
git clone https://github.com/JMowell99/capstone.git
git checkout -b NAME_FOR_YOUR_CHANGES
```
The ```bash -b ``` creates a new "branch" called whatever you like, this is done so that any changes you are making don't interfere with anything that I am doing and vice versa.  If you made some changes you would like to see integrated into the "master" branch (the one you see when you open this repo in github), then just say something to me and I will "merge" your branch into master. If all of this GitHub lingo is confusing, check out [this video](https://www.youtube.com/watch?v=j7YDbrS9I48&ab_channel=RobertChatfield).

## Commiting your changes to the repo
Make sure you are in the top level folder/directory of the repo when you run these commands, or else it will not work. This again, will most likely not be an issue, but I just wanted to clarify.
```bash
git add .
git commit -m "Your commit message. Descibe changes in a few words"
git push origin NAME_FOR_YOUR_CHANGES
```
NOTE: The name that you use for your ```bash git push``` has to exactly match the name you gave your branch when you checked it out.

## Installing dependacies
### Option 1: Python virtual environment
```bash
python3 -m venv /path/to/new/virtual/environment
```
#### MAC
```bash
source ./bin/activate
pip install -r requirements.txt
```
#### WINDOWS
```bash
c:\>c:\Python35\python -m venv c:\path\to\myenv
pip install -r requirements.txt
```

### Option 2: Installing dependencies to your global python
```bash
pip install -r requirements.txt
```
If you use this option, please please please do not commit your requirements.txt to the repo.  This won't be an issue unless you run a ```bash pip freeze > requirements.txt```. I don't see you guys doing this, but just in case.

## Note about website
Towards the end of the main.py, there is a condition about the IP. That IP is what my laptop is on the OSU wifi, which doesn't let me host the website, so I changed it to be on localhost if it detects that I am on OSU wifi; otherwise, the site will run as whatever your device's local IP address is.  You will need to change the IP it needs to check if you want it to do the same for you on osu wifi. Your local IP can be found pretty easy.

#### MAC
Wireless
```bash ipconfig getifaddr en0 ```

Ethernet
```bash ifconfig en0 | grep inet | grep -v inet6 | awk '{print $2}'  ```

#### WINDOWS
Wirelss
```bash ipconfig | findstr IPv4 ```
Ethernet
```bash ipconfig /all | findstr /C:"Ethernet adapter" -A 4 | findstr "IPv4" ```
