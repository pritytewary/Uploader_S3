import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadedUrl(response.data.url);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-4 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none ml-3"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {uploadedUrl && (
          <div className="mt-4">
            <p className="font-semibold">
              File uploaded successfully! Here is the URL:
            </p>
            <a
              href={`http://localhost:3000${uploadedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 place-content-center"
            >
              See your file
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
