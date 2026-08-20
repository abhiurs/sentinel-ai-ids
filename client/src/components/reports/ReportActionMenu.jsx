import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { createPortal } from "react-dom";

import { MoreVertical, Eye, Download, Trash2 } from "lucide-react";

export default function ReportActionMenu({
  report,
  onView,
  onDelete,
  onDownloadPDF,
}) {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef(null);

  const menuRef = useRef(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const closeMenu = () => {
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();

      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    }

    function handleScroll() {
      closeMenu();
    }

    document.addEventListener("mousedown", handleOutside);

    document.addEventListener("keydown", handleEscape);

    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);

      document.removeEventListener("keydown", handleEscape);

      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: "240px",
        zIndex: 99999,
        transform: "translateY(-50%)",
      }}
      className="
        bg-slate-900
        border
        border-slate-700
        rounded-xl
        shadow-2xl
        overflow-hidden
        animate-in
        fade-in
        zoom-in-95
        duration-150
      "
    >
      <button
        onClick={() => {
          onView(report._id);
          closeMenu();
        }}
        className="
          flex
          items-center
          gap-2
          w-full
          px-3
          py-2
          hover:bg-slate-800
          transition
        "
      >
        <Eye size={18} />

        <span className="font-medium">View Report</span>
      </button>

      <button
        onClick={() => {
          onDownloadPDF(report);
          closeMenu();
        }}
        className="
          flex
          items-center
          gap-2
          w-full
          px-3
          py-2
          hover:bg-slate-800
          transition
        "
      >
        <Download size={18} />

        <span className="font-medium">Download PDF</span>
      </button>

      <button
        onClick={() => {
          onDelete(report._id);
          closeMenu();
        }}
        className="
          flex
          items-center
          gap-2
          w-full
          px-3
          py-2
          text-red-400
          hover:bg-red-500/10
          transition
        "
      >
        <Trash2 size={18} />

        <span className="font-medium">Delete Report</span>
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="
          p-2
          rounded-lg
          hover:bg-slate-700
          transition
        "
      >
        <MoreVertical size={18} />
      </button>

      {open && createPortal(menu, document.body)}
    </>
  );
}
