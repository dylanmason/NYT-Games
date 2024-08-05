# NYT Games

## What is this?

Have you ever wondered if there was a way that you could always win NYT games? Welp, with a little bit of automation, this does just that!

Each game in this repo (currently Connections, Strands, and Wordle), leverages the [Puppeteer](https://pptr.dev/category/introduction) npm package to open these games up and play them in Chrome. Currently, all of the answers are visible via looking at the network tab, so this takes advantage of that (sorry if you were expecting AI to try and play this game or something, but it makes for REALLY fast results).

## How do I use this?

To use this locally, you'll first need to clone this repository

```
git clone https://github.com/dylanmason/NYT-games.git
```

Once you have this locally, make sure you are in the project's root directory and run 

```
npm install
```

to install the needed dependencies, then run

```
npm run <game_you_want>
``` 

and it will run the script for the selected game.

## What's next?

I'm thinking of adding a few more games, taking a look back at the current code since at times it can be a little buggy, and adding a feature to log into a personal NYT games account so that you'll get credit for "playing". Currently I only play these 3 NYT games so for the time being these games will be the only ones!