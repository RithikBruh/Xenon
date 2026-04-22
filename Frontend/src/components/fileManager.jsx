import { fetchFiles, uploadFile } from "../api/file.api";
import { useEffect, useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const data = await fetchFiles();
    setFiles(Array.isArray(data) ? data : []);
    console.log("files are ", files);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadFile(file);
      await loadFiles();
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      e.target.value = "";
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="file-manager">
      <h4 className="file-heading">----------- [File Manager] -----------</h4>

      <div className="folders">
        <div className="pages">
          <div className="pages-heading">----------- Pages -----------</div>
          <p>No pages created yet.</p>
        </div>

        <div className="files">
          <div className="files-heading">----------- Files -----------</div>
          {files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div>
              {files.map((file) => (
                <div key={file.id}>
                  {file.file_name}

                  <a href={`/api/download/${file.id}`}>Download</a>
                </div>
              ))}
            </div>
          )}
          
        </div>

        <div className="image-gallery">
          <div className="gallery-heading">-------- Image Gallery --------</div>
          <p>No images uploaded yet.</p>
        </div>

        <div className="link-storage">
          <div className="links-heading">-------- Link Storage --------</div>
          <p>No links saved yet.</p>
        </div>
      </div>

      <div className="filemanager-footer">
        <button className="create-button">Create</button>
       <label for="fileUpload" class="upload-button">
  Upload 
</label>

<input type="file" id="fileUpload" onChange={handleUpload} hidden></input>
        <button className="delete-button">Delete</button>
      </div>
    </div>
  );
}
