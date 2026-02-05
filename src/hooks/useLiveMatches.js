import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export function useLiveMatches() {
    const [liveData, setLiveData] = useState({});

    useEffect(() => {
        const matchesRef = ref(db, "v1_matches");
        const unsubscribe = onValue(matchesRef, (snapshot) => {
            setLiveData(snapshot.val() || {});
        });

        return () => unsubscribe();
    }, []);

    return liveData;
}
