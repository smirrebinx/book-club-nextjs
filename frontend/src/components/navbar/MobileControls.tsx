import MobileMenuButton from "./MobileMenuButton";
import MobileUserAvatar from "./MobileUserAvatar";

import type { Session } from "next-auth";
import type { RefObject } from "react";


interface MobileControlsProps {
  session: Session;
  isMobileMenuOpen: boolean;
  onToggleMenu: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileControls({
  session,
  isMobileMenuOpen,
  onToggleMenu,
  menuButtonRef,
}: MobileControlsProps) {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <MobileUserAvatar session={session} />

      <MobileMenuButton
        isMobileMenuOpen={isMobileMenuOpen}
        onClick={onToggleMenu}
        menuButtonRef={menuButtonRef}
      />
    </div>
  );
}
