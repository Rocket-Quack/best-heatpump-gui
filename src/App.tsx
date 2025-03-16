import React, { useEffect } from "react";
import "./App.css";
import HeatPumpCalculator from "./HeatPumpCalculator.tsx";

const App: React.FC = () => {
    useEffect(() => {
        // Prüfe, ob der session_token bereits in den Cookies vorhanden ist.
        if (!document.cookie.includes("session_token=")) {
            fetch("http://best-heatpump.api.rocketquack.eu:8080/set-cookie", {
                method: "GET",
                credentials: "include", // Damit werden Cookies vom Server verarbeitet
            })
                .then((response) => response.json())
                .then((data) => console.log("Session token erhalten:", data))
                .catch((error) => console.error("Fehler beim Setzen des Cookies:", error));
        }
    }, []);

    return (
        <div className="container">
            <h1>Wärmepumpe Rechner</h1>
            <HeatPumpCalculator />
        </div>
    );
};

export default App;
