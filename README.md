## roomsnitch
It's an HTTP service that uses the raspberry pi's camera to compare a room to a baseline image and report the difference.

My main use is having something that can indicate how close a room is to clean.

### What the ...
My first real raspberry pi project. It's mostly a learning project, but I thought it would be fun* to have something that could drive the state of other things in the house. (like disabling a power outlet to the television).

## Prerequisites
My setup:

 * Raspberry Pi 2
 * Raspberry Pi Camera Board
 * EDIMAX Wireless 802.11b/g/n nano USB adpater (EW-7811Un)
 * Raspbian (Wheezy)
 * Node 5.7.1

## Installation
Please read all of this. Just running `npm install` will tank _hard_.

### Node
To get Node 5.7.x, I used their official tarball download: [node-5.7.1 ARMv7](https://nodejs.org/dist/v5.7.1/node-v5.7.1-linux-armv7l.tar.xz).

I fetch this via `wget` in a download folder, untar it, change to the new directory and then copy everything to /usr/local`.

### g++ >= 4.7
```bash
sudo apt-get install build-essential g++-4.7
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.6 60 --slave /usr/bin/g++ g++ /usr/bin/g++-4.6 
sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.7 40 --slave /usr/bin/g++ g++ /usr/bin/g++-4.7 
sudo update-alternatives --config gcc
```

### Cairo
```bash
sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev
```

### NPM Intall now
Now with all the prerequisites in place, you should be able to get a working install via `npm`:

```bash
npm install
```

## API

### baseline: `POST /api/room`
Capture a new room baseline:
```json
{
	"baseline": "http://{server}:{port}/room-{dateTimeInfo}.png"
}
```

### status: `GET /api/room`
Return URLs for the baseline and current images:

> Notes: 
> * the diff property will be _large_ as it's a base64 encoding of the diff image
> * the mismatch's percentage is "display friendly". Divide by 100 to get a percentage.

```json
{
	"mismatch": "87.84",
	"baseline": "http://{server}:{port}/room-{dateTimeInfo}.png",
	"current": "http://{server}:{port}/room-{dateTimeInfo}.png",
	"diff": "data:image/png;base64,..."
}
```

## Displaying the diff
There's not a super elegant way to do this, but for now, you can use this simple template to get an idea for how easy it is to take the `diff` output and display it in HTML:

```html
<!DOCTYPE="html">
<html>
<head>
</head>
<body>
	<script type="text/javascript">
		var imgData = ""; // setting this to the diff returned from the status call will render a visible diff
 		var img = document.createElement( "img" );
		img.src = imgData;
		document.body.appendChild( img );
	</script>
</body>
</html>
```

It'd be interesting to use something like Jade to render this server side and send it back as HTML at a different route.

## This is why OSS is so cool
I wrote this in about 4 hours total because OSS is awesome:

 * campi - 0.0.5
 * canvas - 1.3.12
 * node-resemble - ^1.1.3

This could have just as easily been done with express, but I used autohost becasue I plan to add some auth and other things eventually.

## Things I may do one day ...
It'd be nice to have a little UI on this thing to make it easy to navigate all the interactions. It'd be especially handy if my kid was able to see the problem areas to address.

__*__ fun for me, not so much for my son :smile: