import { useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { ServeurScreen } from "./serveur";
import { MenuScreen } from "./menu";
import { CommandesScreen } from "./commandes";

type PosTab = "plan" | "menu" | "commandes";

export default function PosScreen() {
  const [activeTab, setActiveTab] = useState<PosTab>("plan");

  return (
    <>
      {activeTab === "plan" ? <ServeurScreen showBottomNav={false} /> : null}
      {activeTab === "menu" ? <MenuScreen showBottomNav={false} /> : null}
      {activeTab === "commandes" ? <CommandesScreen showBottomNav={false} /> : null}

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}
