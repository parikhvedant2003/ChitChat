import { File, FileText } from "lucide-react";

const SERVER_BASE = "";

const FileMessage = ({ fileUrl, fileName, fileType }) => {
  const fullUrl = SERVER_BASE + fileUrl;

  if (fileType?.startsWith("image/")) {
    return (
      <img
        src={fullUrl}
        alt={fileName}
        className="max-w-[200px] rounded-md"
      />
    );
  }

  if (fileType === "application/pdf") {
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 underline hover:opacity-80"
      >
        <FileText className="size-5 shrink-0" />
        <span className="text-sm break-all">{fileName}</span>
      </a>
    );
  }

  return (
    <a
      href={fullUrl}
      download={fileName}
      className="flex items-center gap-2 underline hover:opacity-80"
    >
      <File className="size-5 shrink-0" />
      <span className="text-sm break-all">{fileName}</span>
    </a>
  );
};

export default FileMessage;
