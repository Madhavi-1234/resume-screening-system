import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function DropZone({ title, helper, files, onFileChange, accept = ".pdf", multiple = true }) {
  return (
    <motion.label
      whileHover={{ y: -2 }}
      className="glass-panel flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15"
    >
      <UploadCloud className="text-brand-500" size={28} />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{helper}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
        {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Click to browse"}
      </p>
      <input
        className="hidden"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => onFileChange(Array.from(event.target.files || []))}
      />
    </motion.label>
  );
}
