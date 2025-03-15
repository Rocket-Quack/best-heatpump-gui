import React, { useState } from "react";
import "./App.css";

const App: React.FC = () => {
    // Zustand für Eingabefeld und Überschrift
    const [inputValue, setInputValue] = useState("");
    const [headline, setHeadline] = useState("Willkommen!");

    // Funktion zum Übernehmen des Textes
    const handleClick = () => {
        setHeadline(inputValue);
    };

    return (
        <div className="container">
            <h1>{headline}</h1>
            <div className="input-area">
                <input
                    type="text"
                    placeholder="Gib deinen Text ein"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button onClick={handleClick}>Übernehmen</button>
            </div>
        </div>
    );
};

export default App;
