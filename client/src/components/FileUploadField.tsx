import React, { useState, useMemo, CSSProperties, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const FileUploadField: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileRejectionMessage, setFileRejectionMessage] = useState<string>("");
  const maxFiles = 3; // Limit to 3 files
  const maxSize = 10485760; // 10MB

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "image/png": [],
        "image/jpeg": [],
        "application/pdf": [],
        "text/plain": [],
      },
      onDrop: (acceptedFiles, fileRejections) => {
        if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
          setFileRejectionMessage(
            `You can only upload up to ${maxFiles} files.`
          );
        } else {
          setUploadedFiles((current) => [...current, ...acceptedFiles]);
          setFileRejectionMessage("");
        }

        if (fileRejections.length > 0) {
          setFileRejectionMessage("Some files were rejected.");
        }
      },
      onDropRejected: () => {
        setFileRejectionMessage("File type not accepted or file too large.");
      },
      maxSize,
      maxFiles,
    });

  const deleteFile = (
    fileName: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setUploadedFiles((currentFiles) =>
      currentFiles.filter((file) => file.name !== fileName)
    );
  };

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length > maxLength) {
      return `${name.substring(0, maxLength - 3)}...`;
    }
    return name;
  };

  const dropzoneStyle: CSSProperties = useMemo(
    () => ({
      border: isDragActive ? "2px solid green" : "2px dashed #4a4747cc",
      padding: "20px",
      textAlign: "center",
      backgroundColor: isDragReject
        ? "#ffdddd"
        : isDragActive
        ? "#ddffdd"
        : "#ffffff",
    }),
    [isDragActive, isDragReject]
  );

  const uploadFile = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      try {
        const response = await fetch("http://localhost:3000/upload/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("File uploaded successfully");
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [uploadedFiles]
  );

  return (
    <div {...getRootProps({ style: dropzoneStyle })}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <>
          <p>Drag 'n' drop some files here, or click to select files</p>
          <p>Accepted file types: .png, .jpeg, .pdf, .txt.</p>
          <p>Maximum file size: 10MB.</p>
        </>
      )}
      {fileRejectionMessage && (
        <p style={{ color: "red" }}>{fileRejectionMessage}</p>
      )}
      <ul
        style={{
          paddingLeft: '0'
        }}
      >
        {uploadedFiles.map((file, index) => (
          <li
            key={index}
            style={{
              background: "lightGrey",
              padding: "5px 8px",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "5px",
              gap: "10px",
            }}
          >
            {truncateFileName(file.name)} - {(file.size / 1024).toFixed(2)} KB
            <button onClick={(event) => deleteFile(file.name, event)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {uploadedFiles.length >= maxFiles ? (
        <p style={{ color: "red" }}>File limit reached.</p>
      ) : (
        <div
          style={{
            padding: '5px',
            border: "2px dashed #cccccc",
            color: "#cccccc",
            marginBottom: "10px",
            cursor: 'pointer'
          }}
        >
          <span>Add more files...</span>
        </div>
      )}
      <button
        style={{
          background: "lightGray",
        }}
        disabled={uploadedFiles.length == 0}
        onClick={uploadFile}
      >
        Upload
      </button>
    </div>
  );
};

export default FileUploadField;
