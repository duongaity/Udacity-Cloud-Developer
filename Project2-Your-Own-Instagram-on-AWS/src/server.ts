import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app: Express = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });

  // Endpoint to filter an image from a public url
  app.get("/filteredimage", async (req: Request, res: Response) => {
    // validate the image_url query
    const imageUrl: string = req.query.image_url;

    if (!imageUrl) {
      res.send("Invalid Image Path!")
    } else {
      try {
        // call filterImageFromURL(image_url) to filter the image
        const filteredpath: string = await filterImageFromURL(imageUrl);

        // send the resulting file in the response
        res.sendFile(filteredpath);

        // deletes any files on the server on finish of the response
        setTimeout(async () => {
          await deleteLocalFiles([filteredpath]);
        }, 5000);
      } catch (error) {
        res.status(404).send("Image Path not found!")
      }
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
