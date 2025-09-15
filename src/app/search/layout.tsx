import type { ReactNode } from "react";

export default function SearchLayout({
  children,
  modal, // <- this is the parallel @modal slot
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  // Render the page content and (when present) the modal overlay
  return (
    <>
      {children}
      {modal}
    </>
  );
}
