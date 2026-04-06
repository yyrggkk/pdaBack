import { useEffect, useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { ServeurScreen } from "./serveur";
import { MenuScreen } from "./menu";
import { CommandesScreen } from "./commandes";
import { fetchCommandes } from "../services/posApi";

type PosTab = "plan" | "menu" | "commandes";

export default function PosScreen() {
  const [activeTab, setActiveTab] = useState<PosTab>("plan");
  const [readyCommandesCount, setReadyCommandesCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadReadyCount = async () => {
      try {
        const commandes = await fetchCommandes(["prete"]);
        if (!isMounted) {
          return;
        }

        setReadyCommandesCount(commandes.length);
      } catch {
        if (!isMounted) {
          return;
        }

        setReadyCommandesCount(0);
      }
    };

    loadReadyCount();
    const intervalId = setInterval(loadReadyCount, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {activeTab === "plan" ? <ServeurScreen showBottomNav={false} /> : null}
      {activeTab === "menu" ? <MenuScreen showBottomNav={false} /> : null}
      {activeTab === "commandes" ? <CommandesScreen showBottomNav={false} /> : null}

      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        readyCommandesCount={readyCommandesCount}
      />
    </>
  );
}
