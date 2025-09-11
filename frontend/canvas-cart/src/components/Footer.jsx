import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#555879] text-white text-center py-4 text-sm mt-auto">
      © {new Date().getFullYear()} CanvasCart. All rights reserved.
    </footer>
  );
}
