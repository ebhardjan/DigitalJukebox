# DigitalJukebox

## How to Get It up and Running

### Install Requirements
Install the node requirements with
```bash
npm install
```

### Register at Spotify
- Register the application at Spotify [here](https://developer.spotify.com/my-applications).
Don't forget to add the correct redirect URI.
- Create a file called `config.json` and enter client_id, client_secret and redirect_uri.
See [config_example.json](config_example.json) for a configuration example.

### Run the Server
```
node server.js
```
Now open your browser and go to [http://localhost:3000](http://localhost:3000).

### Requirements
- node.js 8.5.0+
- the Spotify api requires a premium Spotify account
