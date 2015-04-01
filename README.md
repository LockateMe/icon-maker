# icon-maker

A small tool to mask and resize your icon for iOS and Android apps

## Motivation

Because there 2 main mobile platforms today, and that each one of them require to have your app icon in multiple sizes to fit its multiple uses, you may waste quite a lot of time with repetitive `resize & export` tasks. Hence I wrote a little tool that will hopefully do all of this for you.

I've been writing this will working on a Phonegap/Cordova-based app.

## Prerequisites

* Node.js
* ImageMagick

Has been tested on OS X Mavericks. Should work on other OS X versions as well as Linux.

## Usage

Once the prerequisites are available on your computer, complete the setup by running the following commands:


```
git clone https://github.com/LockateMe/icon-maker.git
cd icon-maker
npm install
```

Then, to mask and resize your icon, run:

```
node index.js path/to/your/icon.png [outputFolder]
```

## License

ISC License
