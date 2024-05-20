const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const s3Client = new S3Client({
  endpoint: "https://9f055bd382c71978b5f7677dbfd6c02e.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "auto",
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) throw new Error("File is not provided");

    const extension = file.originalname.split(".").pop();
    if (!extension) throw new Error("Extension is required");

    const fileId = crypto.randomUUID();
    const fileKey = `${fileId}.${extension}`;

    const filePath = `uploads/${fileKey}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    const fileUrl = `/file/${fileKey}`;

    res.json({
      fileKey,
      url: fileUrl,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Failed to upload file");
  }
});

app.get("/file/:id", async (req, res) => {
  try {
    const key = `uploads/${req.params.id}`;

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }),
      {
        expiresIn: 3600,
      }
    );

    res.redirect(307, signedUrl);
  } catch (error) {
    res.status(500).json({
      messgae: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
