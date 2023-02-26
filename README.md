# Capstone
Steve, Mustafa, Ronny, and Josh, make sure that you either: (preferably) create a python virtual environment before running this; or at minimum, install all the dependencies to your global python instance.  To start hosting the website, simply run the main.py file once you have installed the depencies (instuctions below). <b>PLEASE</b> do not edit the source code directly in GitHub, follow the instructions below to make changes.

## Copying this repo to your local computer
In order to be able to download these files, you have to have git install. You can download it for your windows machine [here](https://git-scm.com/download/win). The file to download is called "64-bit Git for Windows Setup". If you are on Mac, you can run these commands to install it.
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
```
Just follow the instructions in the installer.  Once you have that installed you can run the following commands in a terminal of an IDE, or you can open a Command Prompt window. (make sure to change value for NAME_FOR_YOUR_CHANGES)
```bash
git clone https://github.com/JMowell99/capstone.git
cd capstone
git checkout -b NAME_FOR_YOUR_CHANGES
```

The ```-b ``` creates a new "branch" called whatever you like, this is done so that any changes you are making don't interfere with anything that I am doing and vice versa.  If you made some changes you would like to see integrated into the "master" branch (the one you see when you open this repo in github), then just say something to me and I will "merge" your branch into master. If all of this GitHub lingo is confusing, check out [this video](https://www.youtube.com/watch?v=j7YDbrS9I48&ab_channel=RobertChatfield).  If you want to copy a preexisting branch, or copy a branch your created before, don't use a ```-b```.

## Saving your changes to the repo
Make sure you are in the top level folder/directory of the repo when you run these commands, or else it will not work (it will be called capstone). This will most likely not be an issue, but I just wanted to clarify.
```bash
git add .
git commit -m "Your commit message. Descibe changes in a few words"
git push origin NAME_FOR_YOUR_CHANGES
```
NOTE: The name that you use for your ```git push``` has to exactly match the name you gave your branch when you copied the repo.

## Running the code
In order to run the code you also have to have python installed.  You can find that [here](https://www.python.org/downloads/windows). for windows, or [here](https://www.python.org/downloads/macos/). for MacOS.
### Step 1 - Installing dependacies
There are two options here, creating a "virtual environment" of python to install to, or just installing the dependencies to your "global" python version; more info on that [here](https://www.youtube.com/watch?v=IAvAlS0CuxI&ab_channel=NeuralNine)., the first 2 minutes or so explain why.  Once you have your virtual environment running, you should see a ```(.venv)``` on your screen every time you run a command.

#### Option 1: Python virtual environment
This will activate the the virual environment that is already present in this repo. This is also the preffered option when running the code.
##### WINDOWS
```bash
.\.venv\Scripts\activate
pip install -r requirements.txt
```
##### MAC
```bash
src ./.venv/bin/actiavte
pip install -r requirements.txt
```

#### Option 2: Installing dependencies to your global python
If you use this option, please please please do not commit your requirements.txt to the repo.  This won't be an issue unless you run a ```pip freeze > requirements.txt```. I don't see you guys doing this, but just in case.
```bash
pip install -r requirements.txt
```
### Step 2 - Running the code
If you have an IDE, you should be able to click the play button in the "main.py" file. If you don't have an IDE and have to use command prompt, you can run this code after you have installed the dependencies
```python3 main.py```.
After you have done this, you should see something like this:
```bash
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://192.168.0.137:3906
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 785-771-199
 ```

## Note 1 about website
The database that stores user data / passwords is not uploaded to github so when you run the website for the first time you have add your own credentials. This can be done with a simple curl command in a terminal or command prompt once the website is up and running. The IP to use will be the same one that program prints when you start the website.  You also can't use the same instance of the terminal that is currently running the website, so you will need to open another window.(Make sure to change the values for YOUR_NAME, YOUR_PASSWORD, and YOUR_IP)
##### WINDOWS
```bash
Invoke-RestMethod -Uri "http://YOUR_IP:3906/newUser" -Method POST -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer ECE3906" } -Body '{"username": "YOUR_NAME", "password": "YOUR_PASSWORD"}'
```
##### MAC
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ECE3906" -d '{"username": "YOUR_NAME", "password": "YOUR_PASSWORD"}' http://YOUR_IP:3906/newUser
```
## Note 2 about website
Towards the end of the main.py, there is a condition about the IP. That IP is what my laptop is on the OSU WiFi, which doesn't let me host the website, so I changed it to be on localhost if it detects that I am on OSU WiFi; otherwise, the site will run as whatever your device's local IP address is.  You will need to change the IP to check if you want it to do the same for you on osu WiFi.