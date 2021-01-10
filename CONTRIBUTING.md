# System Requirements
|Software|version|
|---|---|
|[NodeJS](https://nodejs.org)| >= 12.0.0|
|[Firefox Browser](https://mozilla.org/firefox)| >= 80|

# Extension Workflow
![save-hash-codeflow](https://res.cloudinary.com/rdaahal/image/upload/v1610281182/FootballStats/save-hash-flow_gp6r47.png)

# Setup on your local machine

1. Fork this repository,
Click on the *fork* icon located on top-right side of this page, below your avatar

2. Clone that *forked* repository.

```bash
git clone https://github.com/[yourUsername]/save-hash.git save-hash
```

3. Set up the *upstream* remote URL for referencing the original repository

```bash
git remote add upstream https://github.com/rahuldahal/save-hash
```

4. from the noteit directory, install necessary dependencies

```bash
cd save-hash
```

```bash
npm install
```

## The generic workflow

1. Pull the latest changes from the original repository (the upstream)

```bash
git pull upstream master
```

2. Then, create a branch for every new feature/bug fix

```bash
git checkout -b [branchName] # eg. git checkout -b flash-message-setup
```

3. Start the web-ext module

```bash
npm start
```

  > This will open a new firefox window and reload the extension whenever a change is made.
  
4. Do your change / Implement a new feature
5. Don't forget to keep pushing your progress to the remote (your *forked* repository)

```bash
git add .
git commit -m "brief about your change..."
git push -u origin [branchName]
```
[message me](https://twitter.com/raahuldaahal) if you have any problem

# Getting ready to send a Pull Request

1. Make sure all the test passes.

```bash
npm test # should pass all the checks
```

2. Create a pull request,
	* Go to your *forked* repository on github,
	* If there are no conflicts, you will see a button saying  **create a new Pull Request**.
	* click on that big green button.
