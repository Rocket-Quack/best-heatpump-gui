import React, { useState } from 'react';
import './HeatPumpCalculator.css';

// Maximale Verbrauchswerte je Brennstoff
const fuelMaxMapping: { [key: string]: number } = {
    oil: 10000,
    gas: 100000,
    wood: 100,
    pellets: 10000,
    electricity: 100000,
};

// Zuordnung der Brennstoffarten zu den entsprechenden Einheiten
const fuelUnitMapping: { [key: string]: string } = {
    oil: 'Liter',
    gas: 'kWh',
    wood: 'Raummeter',
    pellets: 'Kilo',
    electricity: 'kWh',
};

const HeatPumpCalculator: React.FC = () => {
    // States für alle Eingabewerte
    const [plz, setPlz] = useState<string>('');
    const [plzError, setPlzError] = useState<string>('');
    const [fuel, setFuel] = useState<string>('oil');
    const [verbrauch, setVerbrauch] = useState<number | ''>('');
    const [verbrauchError, setVerbrauchError] = useState<string>('');
    const [boilerType, setBoilerType] = useState<string>('niedertemperatur');
    const [vorlauftemp, setVorlauftemp] = useState<string>('35');

    // Aktualisiert die PLZ (nur bis zu 5 Ziffern zulassen)
    const handlePlzChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const regex = /^\d{0,5}$/;
        if (!regex.test(value)) {
            return;
        }
        setPlz(value);
        setPlzError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedKeys = [
            'Backspace',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Delete',
            'Home',
            'End'
        ];
        if (allowedKeys.includes(e.key)) return;
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    // Aktualisiert den Verbrauchswert und validiert ihn
    const handleVerbrauchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const regex = /^[0-9]*$/;
        if (!regex.test(value)) {
            return;
        }
        const intValue = parseInt(value, 10);
        if (isNaN(intValue)) {
            setVerbrauch('');
            setVerbrauchError('');
        } else {
            if (intValue > fuelMaxMapping[fuel]) {
                setVerbrauchError(`Der Wert darf maximal ${fuelMaxMapping[fuel]} ${fuelUnitMapping[fuel]} betragen.`);
            } else {
                setVerbrauchError('');
            }
            setVerbrauch(intValue);
        }
    };

    // Aktualisiert den Brennstoff und setzt verbundene Werte zurück.
    const handleFuelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFuel = e.target.value;
        setFuel(selectedFuel);
        setVerbrauch('');
        setVerbrauchError('');
        if (selectedFuel === 'wood') {
            setBoilerType('old'); // Für Holz: Standard "old" (wird dann zu "alt" gemappt)
        } else {
            setBoilerType('niedertemperatur');
        }
    };

    // Aktualisiert den ausgewählten Kesseltyp
    const handleBoilerTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBoilerType(e.target.value);
    };

    // Aktualisiert die Vorlauftemperatur
    const handleVorlauftempChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setVorlauftemp(e.target.value);
    };

    // Handler für den Berechnen-Button
    const handleSubmit = () => {
        // PLZ validieren: genau 5 Ziffern müssen eingegeben sein.
        if (plz.length !== 5) {
            setPlzError('Bitte geben Sie eine gültige PLZ (5 Ziffern) ein.');
            return;
        }

        // Erstelle ein Objekt, das dem FastAPI-Modell HeatPumpRequest entspricht.
        // Abhängig vom Brennstoff wird der Verbrauch dem jeweiligen Feld zugewiesen.
        const requestBody: any = {
            haus_plz: plz,
            vorlauftemperatur_im_heizsystem: parseInt(vorlauftemp, 10),
            haus_alter: "1979-1994", // Beispielwert – passe diesen ggf. an
        };

        // Verbrauchswerte zuordnen:
        if (fuel === 'oil') {
            requestBody.heiz_verbrauch_ist_oel = verbrauch || 0;
            requestBody.heiz_verbrauch_ist_gas = 0;
            requestBody.heiz_verbrauch_ist_rm = 0;
            requestBody.heiz_verbrauch_ist_pellets = 0;
            requestBody.heiz_verbrauch_ist_kwh = 0;
        } else if (fuel === 'gas') {
            requestBody.heiz_verbrauch_ist_gas = verbrauch || 0;
            requestBody.heiz_verbrauch_ist_oel = 0;
            requestBody.heiz_verbrauch_ist_rm = 0;
            requestBody.heiz_verbrauch_ist_pellets = 0;
            requestBody.heiz_verbrauch_ist_kwh = 0;
        } else if (fuel === 'wood') {
            requestBody.heiz_verbrauch_ist_rm = verbrauch || 0;
            requestBody.heiz_verbrauch_ist_oel = 0;
            requestBody.heiz_verbrauch_ist_gas = 0;
            requestBody.heiz_verbrauch_ist_pellets = 0;
            requestBody.heiz_verbrauch_ist_kwh = 0;
        } else if (fuel === 'pellets') {
            requestBody.heiz_verbrauch_ist_pellets = verbrauch || 0;
            requestBody.heiz_verbrauch_ist_oel = 0;
            requestBody.heiz_verbrauch_ist_gas = 0;
            requestBody.heiz_verbrauch_ist_rm = 0;
            requestBody.heiz_verbrauch_ist_kwh = 0;
        } else if (fuel === 'electricity') {
            requestBody.heiz_verbrauch_ist_kwh = verbrauch || 0;
            requestBody.heiz_verbrauch_ist_oel = 0;
            requestBody.heiz_verbrauch_ist_gas = 0;
            requestBody.heiz_verbrauch_ist_rm = 0;
            requestBody.heiz_verbrauch_ist_pellets = 0;
        }

        // Kesseltyp zuordnen:
        if (fuel === 'wood') {
            // Für Holz wird das Feld heizung_ist_kessel_typ_holz genutzt
            requestBody.heizung_ist_kessel_typ_holz = boilerType === 'old' ? 'alt' : 'neu';
        } else {
            // Für andere Brennstoffe wird das Enum-Feld heizung_ist_kessel_typ genutzt.
            // Mapping: "niedertemperatur" -> "NT", "brennwert" -> "BW", "konventionell" -> "Konv. Kessel"
            const boilerMapping: { [key: string]: string } = {
                niedertemperatur: 'NT',
                brennwert: 'BW',
                konventionell: 'Konv. Kessel',
            };
            requestBody.heizung_ist_kessel_typ = boilerMapping[boilerType] || 'NT';
        }

        // Sende das JSON an den FastAPI-Server (Endpoint anpassen)
        fetch('http://localhost:8080/v1/waermepumpe/berechnen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Erfolgreich gesendet:', data);
                // Hier kannst du bei Erfolg weitere Aktionen durchführen
            })
            .catch(error => {
                console.error('Fehler beim Senden:', error);
                // Hier kannst du Fehler anzeigen oder verarbeiten
            });
    };

    return (
        <div className="heat-pump-calculator" id="i7us">
            <div className="gjs-row" id="il6f">
                <div className="gjs-cell" id="gjs-cell-img">
                    <h3 id="i7us" className="gjs-label">
                        Anleitung zum Rechner
                    </h3>
                    <img
                        id="i73sh"
                        src="/best-heatpump-gui/Baustelle.svg"
                        alt="Wärmepumpe Berechner Logo Illustration"
                        style={{ width: '30%' }}
                    />
                    <p className="gjs-p-text">
                        Dieses Tool zur Berechnung befindet sich noch im Aufbau.
                        Schau gerne zu einem späteren Zeitpunkt vorbei.
                        Hier kannst du für dein Haus die perfekte Wärmepumpe ermitteln.
                    </p>
                </div>
                <div className="gjs-cell" id="ii8h">
                    <form method="get" id="ivd8w" className="calculator-form">
                        <div className="form-group">
                            <label htmlFor="plz" id="i6cn6">PLZ des Gebäudes</label>
                            <input
                                type="text"
                                id="plz"
                                name="plz"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={plz}
                                onChange={handlePlzChange}
                                onKeyDown={handleKeyDown}
                            />
                            {plzError && <div className="error">{plzError}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="fuel" id="i6dmu">Bisheriger Brennstoff</label>
                            <select id="fuel" value={fuel} onChange={handleFuelChange}>
                                <option value="oil">Öl</option>
                                <option value="gas">Gas</option>
                                <option value="wood">Holz</option>
                                <option value="pellets">Pellets</option>
                                <option value="electricity">Strom</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="verbrauch" id="inrxn">Verbrauch</label>
                            <input
                                type="number"
                                id="verbrauch"
                                step="1"
                                value={verbrauch}
                                onChange={handleVerbrauchChange}
                                onKeyDown={handleKeyDown}
                                max={fuelMaxMapping[fuel]}
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                            <small>
                                Maximal: {fuelMaxMapping[fuel]} {fuelUnitMapping[fuel]}
                            </small>
                            {verbrauchError && <div className="error">{verbrauchError}</div>}
                        </div>
                        {/* Radio-Buttons für Kesseltyp */}
                        <div className="form-group" id="i2rel">
                            <label id="iuk1t">Kesseltyp</label>
                            <div className="radio-group">
                                {fuel === 'wood' ? (
                                    <>
                                        <label>
                                            <input
                                                type="radio"
                                                name="boilerType"
                                                value="old"
                                                checked={boilerType === 'old'}
                                                onChange={handleBoilerTypeChange}
                                            />
                                            Alter Kessel
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="boilerType"
                                                value="new"
                                                checked={boilerType === 'new'}
                                                onChange={handleBoilerTypeChange}
                                            />
                                            Neuer Kessel
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <label>
                                            <input
                                                type="radio"
                                                name="boilerType"
                                                value="niedertemperatur"
                                                checked={boilerType === 'niedertemperatur'}
                                                onChange={handleBoilerTypeChange}
                                            />
                                            Niedertemperaturkessel
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="boilerType"
                                                value="brennwert"
                                                checked={boilerType === 'brennwert'}
                                                onChange={handleBoilerTypeChange}
                                            />
                                            Brennwertkessel
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="boilerType"
                                                value="konventionell"
                                                checked={boilerType === 'konventionell'}
                                                onChange={handleBoilerTypeChange}
                                            />
                                            Konventioneller Kessel
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="form-group" id="i6t62">
                            <label htmlFor="vorlauftemp" id="ix7z9">Vorlauftemperatur</label>
                            <select id="vorlauftemp" value={vorlauftemp} onChange={handleVorlauftempChange}>
                                <option value="35">35° Grad</option>
                                <option value="40">40° Grad</option>
                                <option value="45">45° Grad</option>
                                <option value="50">50° Grad</option>
                                <option value="55">55° Grad</option>
                                <option value="60">60° Grad</option>
                                <option value="65">65° Grad</option>
                            </select>
                        </div>
                        <div className="form-group" id="im8i5">
                            <button type="button" onClick={handleSubmit}>Berechnen</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HeatPumpCalculator;
