const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

const app = express();
const port = 3000;

// Configure EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
});

// Home route
app.get("/", (req, res) => {
  res.render("index", { playlists: [], loggedIn: false });
});

// Login route
app.get("/login", (req, res) => {
  console.log("Login route triggered"); // Debug log
  const scopes = ["user-read-private", "user-read-email"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log("Redirecting to:", authorizeURL); // Debug log
  res.redirect(authorizeURL);
});

// Callback route
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token } = data.body;

    // Set access token
    spotifyApi.setAccessToken(access_token);

    // Redirect to home page
    res.redirect("/");
  } catch (error) {
    console.error("Authentication error:", error);
    res.send("Error during authentication");
  }
});

// Search route
app.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    const data = await spotifyApi.searchPlaylists(query, { limit: 10 });
    const playlists = data.body.playlists.items;

    res.render("index", { playlists, loggedIn: true });
  } catch (error) {
    console.error("Search error:", error);
    res.send("Error searching playlists");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});