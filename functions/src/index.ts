import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";

const serviceAccount = require("./FirebaseServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

//  Start writing Firebase Functions
//  https://firebase.google.com/docs/functions/typescript
export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.json({
            message: "Hello from Firebase Functions!",
        });
});

export const getGOTY = functions.https.onRequest( async (request, response) => {
    // functions.logger.info("getGOTY", {structuredData: true});
    // const name = request.query.name || 'No name';
    const gotyRef = db.collection("goty");
    const docsSnap = await gotyRef.get();
    // const data = docsSnap.docs[0].data();
    const games = docsSnap.docs.map((doc) => doc.data());

     response.json({
        games,
     });
});

// Express
const app = express();
app.use(cors({origin: true}));

app.get("/goty", async (req, res) => {
    // functions.logger.info("getGOTY", {structuredData: true});
    // const name = request.query.name || 'No name';
    const gotyRef = db.collection("goty");
    const docsSnap = await gotyRef.get();
    // const data = docsSnap.docs[0].data();
    const games = docsSnap.docs.map((doc) => doc.data());
    res.json({
        ok: true,
        games,
     });
});

app.post("/goty/:id", async (req, res) => {
    const id = req.params.id;
    const gameRef = db.collection("goty").doc(id);
    const gameSnap = await gameRef.get();
    if ( !gameSnap.exists) {
        res.status(404).json({
            ok: false,
            msg: "Does not exists a game with the given ID " + id,
        });
    } else {
        const before = gameSnap.data() || {votes: 0};
        await gameRef.update({
            votes: before.votes + 1,
        });
        res.json({
            ok: true,
            msg: "Thank you for your vote to " + before.name,
        });
    }
});
// exports.api = functions.https.onRequest( app );
export const api = functions.https.onRequest( app );
