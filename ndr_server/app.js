const express = require("express");
const { json } = require("express");
const dotenv = require("dotenv");
const { v2: cloudinary } = require("cloudinary");
const cors = require("cors");

// Instantiate
const app = express();
app.use(cors());

app.use(cors({
    origin: 'http://localhost:4200' // replace with your domain or specific front-end origin
}));

// Needed to read .env file
dotenv.config();

// Config cloudinary sdk with credentials
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET,
    secure: true
});

app.get("/", async (req, res) => {
    res.status(200).json("WORKS");
});

// Returns all the games folder count
app.get('/api/games', async (req, res) => {
    try {
        const folderPath = "samples/ndr-ingame/gallery/*";

        const result = await cloudinary.search.expression('folder:' + folderPath).sort_by('public_id', 'desc').execute();

        const elements = result.resources;

        /* FUNCTION */
        // Function that counts the number of folder and each folder's content
        const baseFolder = 'samples/ndr-ingame/gallery/';
        const folderCounts = {};

        elements.forEach(element => {
            const subFolders = element.folder.replace(baseFolder, '').split('/');

            let currentPath = '';

            subFolders.forEach(subFolder => {
                if (subFolder !== '') {
                    currentPath = currentPath ? `${currentPath}/${subFolder}` : subFolder;

                    if (!folderCounts[currentPath]) {
                        folderCounts[currentPath] = { game_name: currentPath, content_count: 1 };
                    } else {
                        folderCounts[currentPath].content_count++;
                    }
                }
            });
        });

        // If you want an array of these objects instead of a map:
        let games = [];
        for (let key in folderCounts) {
            games.push(folderCounts[key]);
        }

        console.log(games);
        /**/

        res.status(200).json(games);
    } catch (err) {
        res.status(500).json({ error: 'Error in retrieving games' });
    }
});

// Returns all the images in a folder
app.get('/api/game/:gameName', async (req, res) => {
    try {
        const game = req.params.gameName;
        const folderPath = "samples/ndr-ingame/gallery/" + game + "/*";

        const result = await cloudinary.search
            .expression('folder:' + folderPath).sort_by('public_id', 'desc').execute();

        const elements = result.resources;
        res.json({ count: elements.length, elements: elements });
    } catch (err) {
        res.status(500).json({ error: 'Error in retrieving images' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
});
